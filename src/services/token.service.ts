import DBClientPool from "../db-client-pool";
import { DBClient } from "../typings/db";

class TokenService {
  constructor(
    private readonly dbClientPool: DBClientPool
  ) {}

  create(
    userId: any, 
    token: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      INSERT INTO tokens (user_id, token) VALUES
      ($1, $2) RETURNING *;
    `;

    return dbClient.query(query, [userId, token]);
  }

  deleteToken(
    token: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      DELETE FROM tokens WHERE token=$1 RETURNING *;
    `;

    return dbClient.query(query, [token]);
  }

  findTokens(
    attributes: string | any[], 
    values: string[], 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    let filters = "";

    for (let i = 0; i < attributes.length; ++i) {
      if (i > 0) {
        filters += `AND ${attributes[i]}=$${i + 1}`;
        continue;
      }

      filters += `${attributes[i]}=$${i + 1}`;
    }

    const query = `
      SELECT * FROM tokens WHERE ${filters};
    `;

    return dbClient.query(query, values);
  }
}

export default TokenService;
