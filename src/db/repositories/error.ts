import EntityRepository from "./entity-repository";
import Error from "../models/error";
import Segment from "../models/segment";
import Project from "../models/project";
import { convertRawErrorToErrorModel } from "./helpers";
import { DBClient, ErrorSchema } from "../../typings/db";

class ErrorRepository extends EntityRepository<Error>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getByProject(project: Project, dbClient: DBClient = this.dbClient) {
    const query = `
      SELECT error.* FROM 
      error INNER JOIN segment ON error.segment_id=segment.segment_id INNER JOIN project ON segment.project_id=project.project_id
      WHERE project.project_id=$1;
    `;
    const { rows } = await dbClient.query<ErrorSchema>(query, [project.projectId]);

    return rows.map((rawError) => convertRawErrorToErrorModel(rawError));
  }

  async getBySegment(segment: Segment, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM error WHERE segment_id=$1";
    const { rows } = await dbClient.query<ErrorSchema>(query, [segment.segmentId]);

    return rows.map((rawError) => convertRawErrorToErrorModel(rawError));
  }

  async getAll(dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM error;";
    const { rows } = await dbClient.query<ErrorSchema>(query);

    return rows.map((rawError) => convertRawErrorToErrorModel(rawError));
  }

  async getById(id: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM error WHERE error_id=$1;";
    const { rows } = await dbClient.query<ErrorSchema>(query, [id]);

    return rows.length > 0 ? convertRawErrorToErrorModel(rows[0]) : null;
  }

  async create(error: Error, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT
      INTO issue
      (error_id, segment_id, issue_id, severity, type, note, highlight_content, highlight_start_index, highlight_end_index)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    await dbClient.query<ErrorSchema>(
      query, 
      [
        error.errorId,
        error.segmentId,
        error.issueId,
        error.severity,
        error.type,
        error.note,
        error.highlightContent,
        error.highlightStartIndex,
        error.highlightEndIndex
      ]
    );
  }

  async update(error: Error, dbClient: DBClient = this.dbClient) {
    const query = `
      UPDATE error SET
      segment_id=$1,
      issue_id=$2,
      severity=$3,
      type=$4,
      note=$5,
      highlight_content=$6,
      highlight_start_index=$7,
      highlight_end_index=$8
      WHERE error_id=$9
      RETURNING *;
    `;

    await dbClient.query<ErrorSchema>(
      query, 
      [
        error.segmentId,
        error.issueId,
        error.severity,
        error.type,
        error.note,
        error.highlightContent,
        error.highlightStartIndex,
        error.highlightEndIndex,
        error.errorId
      ]
    );
  }

  async delete(error: Error, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM error WHERE error_id=$1;";
    
    await dbClient.query<ErrorSchema>(query, [error.errorId]);
  }
}

export default ErrorRepository;