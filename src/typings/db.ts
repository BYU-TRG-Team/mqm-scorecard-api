import { Pool, PoolClient } from "pg";

export type DBClient = Pool | PoolClient;