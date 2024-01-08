import { DBClient } from "../../typings/db";

abstract class AssociationRepository<X, Y> {
  abstract create(entityX: X, entityY: Y, dbClient: DBClient): Promise<void>;
  abstract delete(entityX: X, entityY: Y, dbClient: DBClient): Promise<void>;
}

export default AssociationRepository;