import EntityRepository from "./entity-repository";
import Segment from "../models/segment";
import Project from "../models/project";
import Issue from "../models/issue";
import { convertRawSegmentToSegmentModel } from "./helpers";
import { DBClient, SegmentSchema } from "../../typings/db";

class IssueRepository extends EntityRepository<Segment>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getByProject(project: Project, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM segment WHERE project_id=$1;";
    const { rows } = await dbClient.query<SegmentSchema>(query, [project.projectId]);

    return rows.map((rawSegment) => convertRawSegmentToSegmentModel(rawSegment));
  }

  async deleteByProject(project: Project, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM segment WHERE project_id=$1;";
    
    await dbClient.query<SegmentSchema>(query, [project.projectId]);
  }

  async getAll(dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM segment ORDER BY project_id ASC, segment_number ASC;";
    const { rows } = await dbClient.query<SegmentSchema>(query);

    return rows.map((rawSegment) => convertRawSegmentToSegmentModel(rawSegment));
  }

  async getById(id: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM segment WHERE segment_id=$1;";
    const { rows } = await dbClient.query<SegmentSchema>(query, [id]);

    return rows.length > 0 ? convertRawSegmentToSegmentModel(rows[0]) : null;
  }

  async create(segment: Segment, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT INTO segment
      (segment_id, project_id, source, target, segment_number)
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    await dbClient.query<SegmentSchema>(
      query, 
      [
        segment.segmentId,
        segment.projectId,
        segment.source,
        segment.target,
        segment.segmentNumber
      ]
    );
  }

  async update(segment: Segment, dbClient: DBClient = this.dbClient) {
    const query = `
      UPDATE segment SET
      project_id=$1,
      source=$2,
      target=$3,
      segment_number=$4
      WHERE segment_id=$5
      RETURNING *;
    `;

    await dbClient.query<SegmentSchema>(
      query, 
      [
        segment.projectId,
        segment.source,
        segment.target,
        segment.segmentNumber,
        segment.segmentId
      ]
    );
  }

  async delete(segment: Segment, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM segment WHERE segment_id=$1;";
    
    await dbClient.query<SegmentSchema>(query, [segment.segmentId]);
  }
}

export default IssueRepository;