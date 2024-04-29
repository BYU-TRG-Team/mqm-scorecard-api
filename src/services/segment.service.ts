import { DBClient } from "../typings/db";
import DBClientPool from "../db-client-pool";

class SegmentService {
  constructor(
    private readonly dbClientPool: DBClientPool
  ) {}

  createSegments(
    segments: any[], 
    projectId: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const values = new Array<any>();
    let paramNum = 1;
    let initialized = false;
    let query = `
      INSERT 
      INTO SEGMENTS(project_id, segment_data, segment_num)
      VALUES 
    `;

    segments.forEach((segment: any, i: number) => {
      if (initialized) {
        query += ", ";
      } else {
        initialized = true;
      }

      values.push(projectId, segment, i + 1);
      query += `($${paramNum}, $${paramNum + 1}, $${paramNum + 2})`;
      paramNum += 3;
    });

    return dbClient.query(query, values);
  }

  deleteSegments(
    attributes: string | any[], 
    values: any[], 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    let filters = "";

    for (let i = 0; i < attributes.length; ++i) {
      if (i > 0) {
        filters += `AND ${attributes[i]}=$${i + 1}`;
        continue;
      }

      filters += `WHERE ${attributes[i]}=$${i + 1}`;
    }

    const query = `
      DELETE FROM segments ${filters};
    `;

    return dbClient.query(query, values);
  }

  getSegmentsByProjectId(
    projectId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT segment_data, segment_num, id FROM segments WHERE project_id=$1 ORDER BY segment_num ASC;
    `;

    return dbClient.query(query, [projectId]);
  }

  getSegmentById(
    segmentId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT * from segments WHERE id=$1
    `;

    return dbClient.query(query, [segmentId]);
  }

  getSegmentByErrorId(
    errorId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT segments.project_id as project_id from segments join errors ON segments.id = errors.segment_id WHERE errors.id=$1
    `;

    return dbClient.query(query, [errorId]);
  }

  setSegmentAttributes(
    attributes: string | any[], 
    values: any[], 
    segmentId: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    let filters = "";
    const numParams = attributes.length;

    for (let i = 0; i < attributes.length; ++i) {
      if (i > 0) {
        filters += ", ";
      }

      filters += `${attributes[i]} = $${i + 1}`;
    }

    const query = `
      UPDATE segments SET ${filters}
      WHERE id=$${numParams + 1} RETURNING *;
    `;

    values.push(segmentId);
    return dbClient.query(query, values);
  }
}

export default SegmentService;
