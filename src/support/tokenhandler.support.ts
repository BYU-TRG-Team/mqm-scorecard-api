import jwtDecode from "jwt-decode";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { roles } from "../roles";
import { CookieOptions } from "express";
import { CleanEnv } from "../clean-env";

class TokenHandler {
  constructor(
    private readonly cleanEnv: CleanEnv
  ) {}

  generateUpdatedUserAuthToken(req: any, newAttributes: any) {
    const {
      id, role, verified, username, rememberMe,
    } = jwtDecode(req.cookies.scorecard_authtoken) as {[key:string]: any};

    const newToken = jwt.sign({
      id, role, verified, username, rememberMe, ...newAttributes,
    }, this.cleanEnv.AUTH_SECRET);

    const cookieOptions: CookieOptions = {
      expires: rememberMe ? new Date(604800000 + Date.now()) : undefined,
      httpOnly: false,
      secure: false,
      sameSite: "strict",
    };

    return {
      newToken,
      cookieOptions,
    };
  }

  isPasswordTokenExpired(user: any) {
    const tokenDate = new Date(user.reset_password_token_created_at);
    const currentDate = new Date();
    return tokenDate.getTime() < (currentDate.getTime() - 1800000); // Password reset token is considered expired after 30 minutes
  }

  generateEmailVerificationToken() {
    return crypto.randomBytes(20).toString("hex");
  }

  generatePasswordResetToken() {
    return {
      resetPasswordToken: crypto.randomBytes(20).toString("hex"),
      resetPasswordTokenCreatedAt: new Date().toISOString(),
    };
  }

  generateUserAuthToken(user: any, req: any) {
    const {
      // eslint-disable-next-line camelcase
      verified, user_id, username, role_id,
    } = user;

    const role = roles[String(role_id)];
    const token = jwt.sign({
      id: user_id, role, verified, username, rememberMe: !!req.body.rememberMe,
    }, this.cleanEnv.AUTH_SECRET);

    const cookieOptions: CookieOptions = {
      expires: req.body.rememberMe ? new Date(604800000 + Date.now()) : undefined,
      httpOnly: false,
      secure: false,
      sameSite: "strict",
    };

    return {
      token,
      cookieOptions,
    };
  }
}

export default TokenHandler;
