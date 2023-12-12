import bcrypt from 'bcrypt';
import errorMessages from '../messages/errors.messages';
import { roles } from '../roles';
import UserService from '../services/user.service';
import TokenHandler from '../support/tokenhandler.support';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { isError } from '../type-guards';

class UserController {
  constructor(
    private readonly userService: UserService, 
    private readonly tokenHandler: TokenHandler, 
    private readonly logger: Logger
  ) {}

  /*
  * PATCH /api/user/:id
  * @username (optional)
  * @email (optional)
  * @name (optional)
  * @password (optional)
  * roleId (optional)
  */
  async updateUser(req: Request, res: Response) {
    const isClientUser = String(req.userId) === req.params.id;
    const newAttributes: {[key: string]: any} = {};
    const superadminNewAttributes: {[key: string]: any} = {};

    Object.keys(req.body).forEach((attr) => {
      if (['username', 'email', 'name', 'password'].includes(attr)) {
        newAttributes[attr] = req.body[attr];
      }

      if (['roleId'].includes(attr)) {
        superadminNewAttributes[attr] = req.body[attr];
      }
    });

    if (newAttributes.password) {
      newAttributes.password = await bcrypt.hash(newAttributes.password, 10);
    }

    try {
      if (
        isClientUser
        && Object.keys(newAttributes).length > 0
      ) {
        const attributes = new Array<any>();
        const values = new Array<any>();
        Object.keys(newAttributes).forEach((attr) => { attributes.push(attr); values.push(newAttributes[attr]); });
        await this.userService.setAttributes(attributes, values, String(req.userId));
      }

      // Update these attributes regardless of whether the param id is equal to the client's id
      if (
        req.role === 'superadmin'
        && Object.keys(superadminNewAttributes).length > 0
      ) {
        const attributes = ['role_id'];
        const values = [superadminNewAttributes.roleId];
        await this.userService.setAttributes(attributes, values, req.params.id);
      }

      if (newAttributes.username) {
        const { newToken, cookieOptions } = await this.tokenHandler.generateUpdatedUserAuthToken(req, newAttributes);
        res.cookie('scorecard_authtoken', newToken, cookieOptions);
        return res.send({ newToken });
      }

      return res.status(204).send();
    } catch (err) {
      if (isError(err)) {
        console.log(err.stack);
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
  * GET /api/user/:id
  */
  async getUser(req: Request, res: Response) {
    if (req.params.id !== String(req.userId)) {
      return res.status(400).send({ message: errorMessages.generic });
    }

    try {
      const usersQuery = await this.userService.findUsers(['user_id'], [req.params.id]);

      if (usersQuery.rows.length === 0) {
        return res.status(404).send({ 
          message: errorMessages.notFound 
        });
      }

      const { email, username, name } = usersQuery.rows[0];

      return res.status(200).send({
        email, username, name,
      });
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
  * GET /api/users
  */
  async getUsers(_req: Request, res: Response) {
    try {
      const usersQuery = await this.userService.getAllUsers();
      const users = usersQuery.rows.map(user => ({
        ...user,
        role_name: roles[String(user.role_id)]
      }));
      
      return res.json({ users })
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
  * DELETE /api/user/:id
  */
  async deleteUser(req: Request, res: Response) {
    try {
      await this.userService.deleteUser(req.params.id);
      return res.status(204).send();
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
}

export default UserController;
