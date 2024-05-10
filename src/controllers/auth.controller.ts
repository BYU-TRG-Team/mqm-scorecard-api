import bcrypt from "bcrypt";
import errorMessages from "../messages/errors.messages";
import SMTPService from "../services/smtp.service";
import UserService from "../services/user.service";
import TokenService from "../services/token.service";
import TokenHandler from "../support/tokenhandler.support";
import DBClientPool from "../db-client-pool";
import { Logger } from "winston";
import { CleanEnv } from "../clean-env";
import { DBClient } from "../typings/db";
import { isError } from "../type-guards";
import { Request, Response } from "express";

class AuthController {
  constructor(
    private readonly smtpService: SMTPService,
    private readonly userService: UserService, 
    private readonly tokenService: TokenService, 
    private readonly tokenHandler: TokenHandler, 
    private readonly dbClientPool: DBClientPool, 
    private readonly logger: Logger,
    private readonly cleanEnv: CleanEnv
  ) {}

  /*
  * POST /api/auth/signup
  * @username
  * @email
  * @password
  * @name
  */
  async signup(req: Request, res: Response) {
    let dbTXNClient: DBClient;
    const {
      username, email, password, name,
    } = req.body;

    if (username === undefined || email === undefined || password === undefined || name === undefined) {
      return res.status(400).send({ 
        message: "Body must include username, email, password, and name" 
      });
    }
    
    try {
      dbTXNClient = await this.dbClientPool.beginTransaction();
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userResponse = await this.userService.create(
        username, 
        email, 
        hashedPassword, 
        1, 
        name, 
        dbTXNClient
      );

      const newUser = userResponse.rows[0];

      this.sendUnverifiedMail(newUser, req, dbTXNClient);

      await this.dbClientPool.commitTransaction(dbTXNClient);
      return res.status(204).send();
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      await this.dbClientPool.rollbackTransaction(dbTXNClient);
      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }
  }

  /*
  * POST /api/auth/signin
  * @username
  * @password
  */
  async signin(req: Request, res: Response) {
    const { username, password } = req.body;

    if (username === undefined || password === undefined) {
      return res.status(400).send({ 
        message: "Body must include a username and password" 
      });
    }

    let dbTXNClient: DBClient;

    try {
      dbTXNClient = await this.dbClientPool.beginTransaction();
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }

    try {
      // No need for db transaction on findUsers method here, simple query.
      const userResponse = await this.userService.findUsers(["username"], [username]);

      if (userResponse.rows.length === 0) {
        return res.status(400).send({ 
          message: errorMessages.loginError 
        });
      }

      const user = userResponse.rows[0];
      const passwordIsValid = bcrypt.compareSync(
        password,
        user.password,
      );

      if (!passwordIsValid) {
        return res.status(400).send({
          message: errorMessages.loginError,
        });
      }

      if (!user.verified) {
        this.sendUnverifiedMail(user, req, dbTXNClient);
      }

      const { token, cookieOptions } = await this.tokenHandler.generateUserAuthToken(user, req);
      res.cookie("scorecard_authtoken", token, cookieOptions);
      await this.dbClientPool.commitTransaction(dbTXNClient);

      return res.json({ token });
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      await this.dbClientPool.rollbackTransaction(dbTXNClient);
      
      return res.status(500).send({ 
        message: errorMessages.generic 
      });
    }
  }

  /*
  * GET /api/auth/logout
  */
  logout(_req: Request, res: Response) {
    return res.clearCookie("scorecard_authtoken", { path: "/" }).send();
  }

  /*
  * GET api/auth/verify/:token
  */
  async verify(req: Request, res: Response) {
    try {
      // Find a matching token
      const verifyTokenResponse = await this.tokenService.findTokens(["token"], [req.params.token]);

      if (verifyTokenResponse.rows.length === 0) {
        return res.redirect("/login");
      }

      const verifyToken = verifyTokenResponse.rows[0];

      // Find associated user
      const userResponse = await this.userService.findUsers(["user_id"], [verifyToken.user_id]);

      if (userResponse.rows.length === 0) {
        return res.status(500).send({ message: errorMessages.generic });
      }

      const user = userResponse.rows[0];

      // Set user as verified
      await this.userService.setAttributes(["verified"], [true], String(user.user_id));
      await this.tokenService.deleteToken(verifyToken.token);
      return res.redirect("/login");
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      res.status(500).send({
        message: errorMessages.generic 
      });
    }
  }

  /*
  * POST api/auth/recovery
  * @email
  */
  async recovery(req: Request, res: Response) {
    const { email } = req.body;

    if (email === undefined) {
      return res.status(400).send({ 
        message: "Body must include email" 
      });
    }

    try {
      const userResponse = await this.userService.findUsers(["email"], [email]);

      if (userResponse.rows.length === 0) {
        return res.redirect("/recover/sent");
      }

      const user = userResponse.rows[0];
      await this.sendPasswordResetEmail(req, user);
      return res.redirect("/recover/sent");
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic 
      });
    }
  }

  /*
  * GET api/auth/recovery/verify/:token
  */
  async verifyRecovery(req: Request, res: Response) {
    try {
      const userResponse = await this.userService.findUsers(["reset_password_token"], [req.params.token]);

      if (userResponse.rows.length === 0) {
        return res.status(400).send({ 
          message: errorMessages.generic 
        });
      }

      const user = userResponse.rows[0];

      if (this.tokenHandler.isPasswordTokenExpired(user)) {
        return res.status(400).send({ 
          message: errorMessages.generic 
        });
      }

      return res.redirect(`/recover/${req.params.token}`);
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic 
      });
    }
  }

  /* POST api/auth/recovery/:token
  * @password
  */
  async processRecovery(req: Request, res: Response) {
    const { password } = req.body;

    if (password === undefined) {
      return res.status(400).json({ message: "Body must include password" });
    }

    try {
      const userResponse = await this.userService.findUsers(["reset_password_token"], [req.params.token]);
      
      if (userResponse.rows.length === 0) {
        return res.status(400).send({ 
          message: errorMessages.generic 
        });
      }

      const user = userResponse.rows[0];

      if (this.tokenHandler.isPasswordTokenExpired(user)) {
        return res.status(400).send({ 
          message: errorMessages.generic 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userService.setAttributes(
        ["password", "reset_password_token"], 
        [hashedPassword, ""], 
        user.user_id
      );

      const { token, cookieOptions } = this.tokenHandler.generateUserAuthToken(user, req);
      res.cookie("scorecard_authtoken", token, cookieOptions);
      return res.send({ token });
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic 
      });
    }
  }

  async createVerificationToken(userId: number, dbClient: DBClient) {
    const emailVerificationToken = this.tokenHandler.generateEmailVerificationToken();
    await this.tokenService.create(
      userId, 
      emailVerificationToken, 
      dbClient
    );

    return emailVerificationToken;
  }

  sendVerificationEmail(req: Request, user: any, token: string) {
    const link = `http://${req.headers.host}/api/auth/verify/${token}`;
    const emailOptions = {
      subject: "Account Verification Request",
      to: user.email,
      from: this.cleanEnv.EMAIL_ADDRESS,
      html: `<p>Hi ${user.username},<p>
      <p>Please <a href="${link}">visit this link</a> to verify your account.</p> 
      <p>If you did not request this, please ignore this email.</p>`,
    };

    return this.smtpService.sendEmail(emailOptions);
  }

  async deleteVerificationTokens(user: any, dbClient: DBClient){
    const response = await this.tokenService.findTokens(["user_id"], [user.user_id], dbClient);

    if (response?.rows == undefined) return;

    const {rows: tokens} = response;

    for (let t = 0; t < tokens.length; t++) {
      await this.tokenService.deleteToken(t, dbClient);
    }
  }

  async sendUnverifiedMail(user: any, req: Request, dbClient: DBClient){
    this.deleteVerificationTokens(user, dbClient);

    const emailVerificationToken = await this.createVerificationToken(user.user_id, dbClient);
    this.sendVerificationEmail(req, user, emailVerificationToken);
  }

  async sendPasswordResetEmail(req: Request, user: any) {
    const { resetPasswordToken, resetPasswordTokenCreatedAt } = this.tokenHandler.generatePasswordResetToken();
    const link = `http://${req.headers.host}/api/auth/recovery/verify/${resetPasswordToken}`;
    const emailOptions = {
      subject: "Password Recovery Request",
      to: user.email,
      from: this.cleanEnv.EMAIL_ADDRESS,
      html: `<p>Hi ${user.username},</p>
      <p>Please <a href="${link}">visit this link</a> to reset your password.</p> 
      <p>If you did not request this, please ignore this email.</p>`,
    };

    await this.userService.setAttributes(
      ["reset_password_token", "reset_password_token_created_at"], 
      [resetPasswordToken, resetPasswordTokenCreatedAt], 
      user.user_id
    );

    this.smtpService.sendEmail(emailOptions);
  }
}

export default AuthController;
