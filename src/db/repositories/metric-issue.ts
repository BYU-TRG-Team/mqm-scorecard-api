import EntityRepository from "./entity-repository";
import MetricIssue from "../models/metric-issue";
import { convertRawMetricIssueToMetricIssueModel } from "./helpers";
import { DBClient, MetricIssueSchema } from "../../typings/db";

class IssueRepository extends EntityRepository<MetricIssue>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getAll(dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM metric_issue;";
    const { rows } = await dbClient.query<MetricIssueSchema>(query);

    return rows.map((rawMetricIssue) => convertRawMetricIssueToMetricIssueModel(rawMetricIssue));
  }

  async getById(id: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM metric_issue WHERE metric_issue_id=$1;";
    const { rows } = await dbClient.query<MetricIssueSchema>(query, [id]);

    return rows.length > 0 ? convertRawMetricIssueToMetricIssueModel(rows[0]) : null;
  }

  async create(metricIssue: MetricIssue, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT INTO metric_issue
      (metric_issue_id, project_id, issue_id, is_visible)
      VALUES
      ($1, $2, $3, $4)
      RETURNING *;
    `;

    await dbClient.query<MetricIssueSchema>(
      query, 
      [
        metricIssue.metricIssueId,
        metricIssue.projectId,
        metricIssue.issueId,
        metricIssue.isVisible
      ]
    );
  }

  async update(metricIssue: MetricIssue, dbClient: DBClient = this.dbClient) {
    const query = `
      UPDATE project SET
      project_id=$1,
      issue_id=$2,
      is_visible=$3
      WHERE metric_issue_id=$4
      RETURNING *;
    `;

    await dbClient.query<MetricIssueSchema>(
      query, 
      [
        metricIssue.projectId,
        metricIssue.issueId,
        metricIssue.isVisible,
        metricIssue.metricIssueId
      ]
    );
  }

  async delete(metricIssue: MetricIssue, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM metric_issue WHERE metric_issue_id=$1;";
    
    await dbClient.query<MetricIssueSchema>(query, [metricIssue.metricIssueId]);
  }
}

export default IssueRepository;