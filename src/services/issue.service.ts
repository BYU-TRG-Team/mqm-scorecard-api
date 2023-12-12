import { DBClient } from "../typings/db";
import DBClientPool from "../db-client-pool";

class IssueService {
  constructor(
    private readonly dbClientPool: DBClientPool
  ) {}

  getIssueById(
    id: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const getIssueQuery = `
      SELECT 
      *
      FROM issues
      WHERE id=$1;
  `;

    return dbClient.query(getIssueQuery, [id]);
  }

  createIssue(
    id: any,
    parent: any, 
    name: any, 
    description: any, 
    notes: any, 
    examples: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      INSERT 
      INTO issues(id, parent, name, description, notes, examples)
      VALUES
      ($1, $2, $3, $4, $5, $6)
    `;

    return dbClient.query(query, [id, parent, name, description, notes, examples]);
  }

  createProjectIssue(
    projectId: any, 
    issue: any, 
    display: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const createProjectIssueQuery = `
      INSERT
      INTO project_issues(project_id, issue, display)
      VALUES
      ($1, $2, $3)
    `;

    return dbClient.query(createProjectIssueQuery, [projectId, issue, display]);
  }

  getProjectIssuesById(
    projectId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT 
      issues.id as issue, 
      issues.parent as parent, 
      issues.name as name, 
      issues.description as description, 
      issues.notes as notes, 
      issues.examples as examples 
      FROM issues JOIN project_issues ON issues.id = project_issues.issue 
      WHERE project_issues.project_id=$1;
    `;

    return dbClient.query(query, [projectId]);
  }

  deleteIssues(
    attributes: string | any[], 
    values: never[], 
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
      DELETE FROM issues ${filters};
    `;

    return dbClient.query(query, values);
  }

  getAllIssues(dbClient: DBClient = this.dbClientPool.connectionPool) {
    const query = `
      SELECT 
      id as issue, 
      parent as parent, 
      name as name, 
      description as description, 
      notes as notes, 
      examples as examples 
      FROM issues;
    `;

    return dbClient.query(query);
  }

  addSegmentIssue(
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
      INTO segment_issues(segment_id, note, highlighting, issue, level, type, highlight_start_index, highlight_end_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING;
    `;

    return dbClient.query(query, [segmentId, note, highlighting, issue, level, type, highlightStartindex, highlightEndIndex]);
  }

  getSegmentIssuesBySegmentId(
    segmentId: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT 
      segment_issues.id as id, 
      segment_issues.segment_id as segment_id, 
      segment_issues.issue as issue,
      segment_issues.level as level,
      segment_issues.type as type,
      segment_issues.highlighting as highlighting,
      segment_issues.note as note,
      issues.name as issue_name
      FROM segment_issues JOIN issues ON segment_issues.issue = issues.id
      WHERE segment_id=$1
    `;

    return dbClient.query(query, [segmentId]);
  }

  getSegmentIssuesByProjectId(
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
          segment_issues.id as id, 
          segment_issues.segment_id as segment_id, 
          segment_issues.issue as issue, 
          segment_issues.level as level,
          segment_issues.type as type,
          segment_issues.highlighting as highlighting,
          segment_issues.note as note,
          segment_issues.highlight_start_index as highlight_start_index,
          segment_issues.highlight_end_index as highlight_end_index,
          segments.project_id as project_id
          FROM segment_issues JOIN segments ON segment_issues.segment_id=segments.id) table1
        ON
        issues.id = table1.issue
        WHERE table1.project_id=$1  
        ORDER BY id ASC;
    `;

    return dbClient.query(query, [projectId]);
  }

  deleteSegmentIssueById(
    issueId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      DELETE FROM segment_issues WHERE id=$1;
    `;

    return dbClient.query(query, [issueId]);
  }

  getSegmentIssueById(
    issueId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT * FROM segment_issues WHERE id=$1;
    `;

    return dbClient.query(query, [issueId]);
  }

  updateSegmentIssue(
    segmentIssue: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      UPDATE segment_issues
      SET segment_id=$1, issue=$2, level=$3, type=$4, highlighting=$5, note=$6, highlight_start_index=$7, highlight_end_index=$8
      WHERE id=$9;
    `;

    return dbClient.query(query, [
      segmentIssue.segment_id,
      segmentIssue.issue,
      segmentIssue.level,
      segmentIssue.type,
      segmentIssue.highlighting,
      segmentIssue.note,
      segmentIssue.highlight_start_index,
      segmentIssue.highlight_end_index,
      segmentIssue.id
    ]);
  }

  getProjectReportById(
    projectId: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT 
      table2.issue as issue, 
      json_agg(table2.type) as type, 
      json_agg(table2.level) as level 
      FROM (
        SELECT 
        issues.id as issue, 
        table1.level, 
        table1.type FROM issues LEFT JOIN (
          SELECT 
          segment_issues.level as level, 
          segment_issues.type as type, 
          segment_issues.issue as issue 
          FROM segment_issues join segments ON segment_issues.segment_id = segments.id WHERE segments.project_id=$1
        ) as table1 
        ON issues.id = table1.issue
      ) table2 
      GROUP BY table2.issue;
    `;

    return dbClient.query(query, [projectId]);
  }
}

export default IssueService;
