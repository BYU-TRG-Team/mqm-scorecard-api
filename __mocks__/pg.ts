const pg = jest.createMockFromModule("pg") as any;

export class PoolClient {
  query = jest.fn();
  release = jest.fn();
}

export class Pool {
  query = jest.fn();
  connect = jest.fn(() => new Promise<PoolClient>((resolve) => resolve(new PoolClient())));
}

pg.Pool = Pool;

export default pg;