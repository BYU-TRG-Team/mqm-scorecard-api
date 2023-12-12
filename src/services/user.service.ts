import { DBClient } from "../typings/db";
import DBClientPool from "../db-client-pool";

class UserService {
  constructor(
    private readonly dbClientPool: DBClientPool
  ) {}

  create(
    username: any, 
    email: any, 
    password: string, 
    roleId: number, 
    name: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      INSERT INTO users (username, email, password, role_id, name) VALUES
      ($1, $2, $3, $4, $5) RETURNING *;
    `;

    return dbClient.query(query, [username, email, password, roleId, name]);
  }

  setAttributes(
    attributes: string | any[], 
    values: any[], 
    userId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    let filters = '';
    const numParams = attributes.length;

    for (let i = 0; i < numParams; ++i) {
      if (i > 0) filters += ', ';

      filters += `${attributes[i]} = $${i + 1}`;
    }

    values.push(userId);

    const query = `
      UPDATE users SET ${filters}
      WHERE user_id=$${numParams + 1} RETURNING *;
    `;

    return dbClient.query(query, values);
  }

  findUsers(
    attributes: string | any[], 
    values: any[], 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    let filters = '';

    for (let i = 0; i < attributes.length; ++i) {
      if (i > 0) {
        filters += `AND ${attributes[i]}=$${i + 1}`;
        continue;
      }

      filters += `WHERE ${attributes[i]}=$${i + 1}`;
    }

    const query = `
      SELECT * FROM users ${filters};
    `;

    return dbClient.query(query, values);
  }

  getAllUsers(dbClient: DBClient = this.dbClientPool.connectionPool) {
    const query = `
      SELECT * FROM users ORDER BY user_id ASC;
    `;

    return dbClient.query(query);
  }

  deleteUser(userId: string, dbClient: DBClient = this.dbClientPool.connectionPool) {
    const query = `
      DELETE FROM users WHERE user_id=$1;
    `;

    return dbClient.query(query, [userId]);
  }
}

export default UserService;
