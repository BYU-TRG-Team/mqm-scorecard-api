import { DBClient } from "../typings/db";
import DBClientPool from "../db-client-pool";

class ProjectService {
  constructor(
    private readonly dbClientPool: DBClientPool
  ) {}

  createProject(
    projectName: any, 
    specificationsFileName: string, 
    specifications: string, 
    metricFileName: string, 
    bitextFileName: string, 
    sourceWordCount: number, 
    targetWordCount: number, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const createProjectQuery = `
      INSERT
      INTO projects(name, specifications_file, specifications, metric_file, bitext_file, source_word_count, target_word_count)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
      project_id;
    `;

    return dbClient.query(createProjectQuery, [projectName, specificationsFileName, specifications, metricFileName, bitextFileName, sourceWordCount, targetWordCount]);
  }

  mapUsertoProject(
    projectId: string, 
    userId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const mapUserToProjectQuery = `
      INSERT
      INTO user_projects(project_id, user_id)
      VALUES
      ($1, $2);
    `;

    return dbClient.query(mapUserToProjectQuery, [projectId, userId]);
  }

  getAllProjects(dbClient: DBClient = this.dbClientPool.connectionPool) {
    const query = `
      SELECT * FROM projects ORDER BY project_id ASC;
    `;

    return dbClient.query(query);
  }

  getProjectsByUserId(
    userId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT
      projects.project_id as project_id, 
      name, 
      specifications_file, 
      metric_file, 
      bitext_file, 
      specifications, 
      last_segment, 
      finished
      FROM projects join user_projects ON projects.project_id=user_projects.project_id
      WHERE user_projects.user_id=$1
    `;

    return dbClient.query(query, [userId]);
  }

  deleteProjectById(
    projectId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      DELETE 
      FROM projects
      WHERE project_id=$1
    `;

    return dbClient.query(query, [projectId]);
  }

  deleteUserFromAllProjects(
    userId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      DELETE 
      FROM user_projects 
      WHERE user_id=$1;
    `;

    return dbClient.query(query, [userId]);
  }

  getProjectById(
    projectId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT
      * 
      FROM projects
      WHERE project_id=$1;
    `;

    return dbClient.query(query, [projectId]);
  }

  getProjectUsersById(
    projectId: any, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      SELECT
      users.username as username,
      users.user_id as user_id
      FROM 
      users JOIN user_projects ON users.user_id=user_projects.user_id
      WHERE user_projects.project_id=$1
    `;

    return dbClient.query(query, [projectId]);
  }

  deleteUserFromProject(
    userId: string, 
    projectId: string, 
    dbClient: DBClient = this.dbClientPool.connectionPool
  ) {
    const query = `
      DELETE FROM
      user_projects
      WHERE user_id=$1 AND project_id=$2
    `;

    return dbClient.query(query, [userId, projectId]);
  }

  setProjectAttributes(
    attributes: string | any[], 
    values: any[], 
    projectId: any, 
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
      UPDATE projects SET ${filters}
      WHERE project_id=$${numParams + 1} RETURNING *;
    `;

    values.push(projectId);
    return dbClient.query(query, values);
  }
}

export default ProjectService;
