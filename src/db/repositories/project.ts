import EntityRepository from "./entity-repository";
import Project from "../models/project";
import { convertRawProjectToProjectModel } from "./helpers";
import { DBClient, ProjectSchema } from "../../typings/db";

class ProjectRepository extends EntityRepository<Project>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getAll(dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM project ORDER BY name ASC;";
    const { rows } = await dbClient.query<ProjectSchema>(query);

    return rows.map((rawProject) => convertRawProjectToProjectModel(rawProject));
  }

  async getById(id: string, dbClient: DBClient = this.dbClient) {
    const query = "SELECT * FROM project WHERE project_id=$1;";
    const { rows } = await dbClient.query<ProjectSchema>(query, [id]);

    return rows.length > 0 ? convertRawProjectToProjectModel(rows[0]) : null;
  }

  async create(project: Project, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT INTO projects
      (project_id, name, specifications_file, metric_file, bitext_file, specifications, last_segment, is_finished, source_word_count, target_word_count)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    await dbClient.query<ProjectSchema>(
      query, 
      [
        project.projectId,
        project.name,
        project.specificationsFile,
        project.metricFile,
        project.bitextFile,
        project.specifications,
        project.lastSegment,
        project.isFinished,
        project.sourceWordCount,
        project.targetWordCount
      ]
    );
  }

  async update(project: Project, dbClient: DBClient = this.dbClient) {
    const query = `
      UPDATE project SET
      name=$1,
      metric_file=$2,
      bitext_file=$3,
      last_segment=$4,
      is_finished=$5,
      source_word_count=$6,
      target_word_count=$7,
      specifications_file=$8,
      specifications=$9
      WHERE project_id=$10
      RETURNING *;
    `;

    await dbClient.query<ProjectSchema>(
      query, 
      [
        project.name,
        project.metricFile,
        project.bitextFile,
        project.lastSegment,
        project.isFinished,
        project.sourceWordCount,
        project.targetWordCount,
        project.specificationsFile,
        project.specifications,
        project.projectId
      ]
    );
  }

  async delete(project: Project, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM project WHERE project_id=$1;";
    
    await dbClient.query<ProjectSchema>(query, [project.projectId]);
  }
}

export default ProjectRepository;