import EntityRepository from "./entity-repository";
import User from "../models/user";
import { DBClient, UserSchema } from "../../typings/db";
import { convertRawUserToUserModel } from "./helpers";

class UserRepository extends EntityRepository<User>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getByUsername(username: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM user WHERE username=$1;";
    const { rows } = await dbClient.query<UserSchema>(query, [username]);

    return rows.length > 0 ? convertRawUserToUserModel(rows[0]) : null;
  }

  async getByEmail(email: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM user WHERE email=$1;";
    const { rows } = await dbClient.query<UserSchema>(query, [email]);

    return rows.length > 0 ? convertRawUserToUserModel(rows[0]) : null;
  }

  async getByResetPasswordToken(token: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM user WHERE reset_password_token=$1;";
    const { rows } = await dbClient.query<UserSchema>(query, [token]);

    return rows.length > 0 ? convertRawUserToUserModel(rows[0]) : null;
  }

  async getByEmailVerificationToken(token: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM user WHERE email_verification_token=$1;";
    const { rows } = await dbClient.query<UserSchema>(query, [token]);

    return rows.length > 0 ? convertRawUserToUserModel(rows[0]) : null;
  }

  async getAll(dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM user ORDER BY name ASC;";
    const { rows } = await dbClient.query<UserSchema>(query);

    return rows.map((rawUser) => convertRawUserToUserModel(rawUser))
  }

  async getById(id: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM user WHERE user_id=$1;";
    const { rows } = await dbClient.query<UserSchema>(query, [id]);

    return rows.length > 0 ? convertRawUserToUserModel(rows[0]) : null;
  }

  async create(user: User, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT INTO user
      (user_id, username, verified, password, email, name, role, reset_password_token, reset_password_token_created_at)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    await dbClient.query<UserSchema>(
      query, 
      [
        user.userId,
        user.username,
        user.verified,
        user.password,
        user.email,
        user.name,
        user.role,
        user.resetPasswordToken,
        user.resetPasswordToken
      ]
    );
  }

  async update(user: User, dbClient: DBClient = this.dbClient) {
    const query = `
      UPDATE project SET
      username=$1,
      verified=$2,
      password=$3,
      email=$4,
      name=$5,
      role=$6,
      reset_password_token=$7,
      reset_password_token_created_at=$8
      WHERE user_id=$9
      RETURNING *;
    `;

    await dbClient.query<UserSchema>(
      query, 
      [
        user.username,
        user.verified,
        user.password,
        user.email,
        user.name,
        user.role,
        user.resetPasswordToken,
        user.resetPasswordTokenCreatedAt,
        user.userId
      ]
    );
  }

  async delete(user: User, dbClient: DBClient = this.dbClient) {
    const query = " DELETE FROM user WHERE user_id=$1;";

    await dbClient.query<UserSchema>(query, [user.userId]);
  }
}

export default UserRepository;