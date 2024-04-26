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
    let filters = "";

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
}

export default IssueService;
