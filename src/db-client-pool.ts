import pg, { PoolClient } from "pg";

class DBClientPool {
  constructor(public readonly connectionPool: pg.Pool) {}

  /**
   * Retrieves a client from the connection pool and begins a transaction using the client. 
   */
  async beginTransaction() {
    const client = await this.connectionPool.connect();
    await client.query("BEGIN");
    return client;
  }

  /**
   * Commits an ongoing transaction for a client and releases the client.
   */
  async commitTransaction(client: PoolClient) {
    await client.query("COMMIT");
    client.release();
  }

  /**
   * Executes a rollback on an ongoing transaction for a client and releases the client.
   */
  async rollbackTransaction(client: PoolClient) {
    await client.query("ROLLBACK");
    client.release();
  }
}

export default DBClientPool;