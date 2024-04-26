import { DBClient } from "../typings/db";
import DBClientPool from "../db-client-pool";

class ErrorService {
  constructor(
    private readonly dbClientPool: DBClientPool
  ) {}

  addError(
    segmentId: string, 
    note: any, 
    highlighting: any, 
    issue: any, 
    level: any, 
    type: any, 
    highlightStartindex: any, 
    highlightEndIndex: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      INSERT 
      INTO errors(segment_id, note, highlighting, issue, level, type, highlight_start_index, highlight_end_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING;
    `;

    return dbClient.query(query, [segmentId, note, highlighting, issue, level, type, highlightStartindex, highlightEndIndex]);
  }

  getErrorsBySegmentId(
    segmentId: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT 
      errors.id as id, 
      errors.segment_id as segment_id, 
      errors.issue as issue,
      errors.level as level,
      errors.type as type,
      errors.highlighting as highlighting,
      errors.note as note,
      issues.name as issue_name
      FROM errors JOIN issues ON errors.issue = issues.id
      WHERE segment_id=$1
    `;

    return dbClient.query(query, [segmentId]);
  }

  getErrorsByProjectId(
    projectId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT 
      table1.id as id, 
      table1.segment_id as segment_id, 
      table1.issue as issue, 
      table1.level as level,
      table1.type as type,
      table1.highlighting as highlighting,
      table1.note as note,
      table1.highlight_start_index as highlight_start_index,
      table1.highlight_end_index as highlight_end_index,
      issues.name as issue_name
      FROM 
        issues JOIN
        (SELECT 
          errors.id as id, 
          errors.segment_id as segment_id, 
          errors.issue as issue, 
          errors.level as level,
          errors.type as type,
          errors.highlighting as highlighting,
          errors.note as note,
          errors.highlight_start_index as highlight_start_index,
          errors.highlight_end_index as highlight_end_index,
          segments.project_id as project_id
          FROM errors JOIN segments ON errors.segment_id=segments.id) table1
        ON
        issues.id = table1.issue
        WHERE table1.project_id=$1  
        ORDER BY id ASC;
    `;

    return dbClient.query(query, [projectId]);
  }

  deleteErrorById(
    errorId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      DELETE FROM errors WHERE id=$1;
    `;

    return dbClient.query(query, [errorId]);
  }

  getErrorById(
    errorId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT * FROM errors WHERE id=$1;
    `;

    return dbClient.query(query, [errorId]);
  }

  updateError(
    error: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      UPDATE errors
      SET segment_id=$1, issue=$2, level=$3, type=$4, highlighting=$5, note=$6, highlight_start_index=$7, highlight_end_index=$8
      WHERE id=$9;
    `;

    return dbClient.query(query, [
      error.segment_id,
      error.issue,
      error.level,
      error.type,
      error.highlighting,
      error.note,
      error.highlight_start_index,
      error.highlight_end_index,
      error.id
    ]);
  }
}

export default ErrorService;
