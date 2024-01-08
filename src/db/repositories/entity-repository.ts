import { DBClient } from "../../typings/db";

abstract class EntityRepository<T> {
  abstract getAll(dbClient: DBClient): Promise<T[]>;
  abstract getById(id: string, dbClient: DBClient): Promise<T | null>;
  abstract create(entity: T, dbClient: DBClient): Promise<void>;
  abstract update(entity: T, dbClient: DBClient): Promise<void>;
  abstract delete(entity: T, dbClient: DBClient): Promise<void>;
}

export default EntityRepository;