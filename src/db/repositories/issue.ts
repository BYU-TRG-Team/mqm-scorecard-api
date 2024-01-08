import EntityRepository from "./entity-repository";
import Issue from "../models/issue";
import { convertRawIssueToIssueModel } from "./helpers";
import { DBClient, IssueSchema, ProjectReportQuery } from "../../typings/db";
import Project from "../models/project";

class IssueRepository extends EntityRepository<Issue>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getProjectReport(project: Project, dbClient: DBClient = this.dbClient) {
    const query = `
      SELECT issue.*, json_agg(error.type) as type, json_agg(error.severity) as level FROM
      segment INNER JOIN error ON error.segment_id=segment.segment_id AND segment.project_id=$1 RIGHT JOIN issue ON issue.issue_id=error.issue_id
      GROUP BY issues.id;
    `;
    const { rows } = await dbClient.query<ProjectReportQuery>(query, [project.projectId]);

    return rows.map((row) => ({
      issue: convertRawIssueToIssueModel(row),
      type: row.type,
      severity: row.severity
    }));
  }

  async getByProject(project: Project, dbClient: DBClient = this.dbClient) {
    const query = `
      SELECT issue.* FROM 
      issue INNER JOIN metric_issue ON issue.issue_id=metric_issue.issue_id
      WHERE metric_issue.project_id=$1;`;
    const { rows } = await dbClient.query<IssueSchema>(query, [project.projectId]);

    return rows.map((rawIssue) => convertRawIssueToIssueModel(rawIssue));
  }

  async deleteAll(dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM issue;";
    
    await dbClient.query<IssueSchema>(query);
  }

  async getAll(dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM issue ORDER BY name ASC;";
    const { rows } = await dbClient.query<IssueSchema>(query);

    return rows.map((rawIssue) => convertRawIssueToIssueModel(rawIssue));
  }

  async getById(id: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM issue WHERE issue_id=$1;";
    const { rows } = await dbClient.query<IssueSchema>(query, [id]);

    return rows.length > 0 ? convertRawIssueToIssueModel(rows[0]) : null;
  }

  async create(issue: Issue, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT INTO issue
      (issue_id, parent, name, description, notes, examples)
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    await dbClient.query<IssueSchema>(
      query, 
      [
        issue.issueId,
        issue.parent,
        issue.name,
        issue.description,
        issue.notes,
        issue.examples
      ]
    );
  }

  async update(issue: Issue, dbClient: DBClient = this.dbClient) {
    const query = `
      UPDATE project SET
      parent=$1,
      name=$2,
      description=$3,
      notes=$4,
      examples=$5
      WHERE issue_id=$6
      RETURNING *;
    `;

    await dbClient.query<IssueSchema>(
      query, 
      [
        issue.parent,
        issue.name,
        issue.description,
        issue.notes,
        issue.examples,
        issue.issueId
      ]
    );
  }

  async delete(issue: Issue, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM issue WHERE issue_id=$1;";
    
    await dbClient.query<IssueSchema>(query, [issue.issueId]);
  }
}

export default IssueRepository;