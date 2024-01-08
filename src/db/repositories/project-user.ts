import Project from "../models/project";
import User from "../models/user";
import { convertRawProjectToProjectModel, convertRawUserToUserModel } from "./helpers";
import { DBClient, ProjectSchema, ProjectUserSchema, UserSchema } from "../../typings/db";
import AssociationRepository from "./association-repository";

class ProjectUserRepository extends AssociationRepository<Project, User>{
  private dbClient: DBClient;
  
  constructor(dbClient: DBClient) {
    super();
    this.dbClient = dbClient;
  }

  async getAllUsers(project: Project, dbClient: DBClient = this.dbClient) {
    const query = `
      SELECT user.* FROM 
      user INNER JOIN project_user ON user.user_id=project_user.user_id
      WHERE project_user.project_id=$1;
    `;
    const { rows } = await dbClient.query<UserSchema>(query, [project.projectId])

    return rows.map((rawUser) => convertRawUserToUserModel(rawUser));
  }

  async deleteAllProjects(user: User, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM project_user WHERE user_id=$1;";

    return dbClient.query(query, [user.userId]);
  }

  async getAllProjects(user: User, dbClient: DBClient = this.dbClient) {
    const query = `
      SELECT project.* FROM 
      project INNER JOIN project_user ON project.project_id=project_user.project_id
      WHERE project_user.user_id=$1;
    `;
    const { rows } = await dbClient.query<ProjectSchema>(query, [user.userId])

    return rows.map((rawProject) => convertRawProjectToProjectModel(rawProject));
  }
  
  async create(project: Project, user: User, dbClient: DBClient = this.dbClient) {
    const query = `
      INSERT INTO project_user
      (project_id, user_id)
      VALUES
      ($1, $2)
      RETURNING *;
    `;

    await dbClient.query<ProjectUserSchema>(query, [project.projectId, user.userId]);
  }

  async delete(project: Project, user: User, dbClient: DBClient = this.dbClient) {
    const query = "DELETE FROM project_user WHERE user_id=$1 AND project_id=$2;";
    
    await dbClient.query<ProjectUserSchema>(query, [user.userId, project.projectId]);
  }
}

export default ProjectUserRepository;