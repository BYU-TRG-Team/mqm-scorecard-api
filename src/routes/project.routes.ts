import Bottle from "bottlejs";
import { verifyToken, checkVerification, checkRole } from "../middleware/auth.middleware";
import { Express } from "express";

export default (app: Express, bottle: Bottle) => {
  app.post(
    '/api/project',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(['superadmin', 'admin']),
    bottle.container.ProjectController.createProject.bind(bottle.container.ProjectController),
  );

  app.get(
    '/api/project/:projectId/report',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.ProjectController.getProjectJSONReport.bind(bottle.container.ProjectController),
  );

  app.get(
    '/api/projects',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.ProjectController.getProjects.bind(bottle.container.ProjectController),
  );

  app.delete(
    '/api/project/:projectId',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(['admin', 'superadmin']),
    bottle.container.ProjectController.deleteProject.bind(bottle.container.ProjectController),
  );

  app.get(
    '/api/project/:projectId',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.ProjectController.getProject.bind(bottle.container.ProjectController),
  );

  app.delete(
    '/api/project/:projectId/user/:userId',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(['admin', 'superadmin']),
    bottle.container.ProjectController.deleteUserFromProject.bind(bottle.container.ProjectController),
  );

  app.delete(
    '/api/user/:userId/projects',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(['superadmin']),
    bottle.container.ProjectController.deleteUserFromAllProjects.bind(bottle.container.ProjectController),
  );

  app.post(
    '/api/project/:projectId/user',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(['admin', 'superadmin']),
    bottle.container.ProjectController.addUserToProject.bind(bottle.container.ProjectController),
  );

  app.put(
    '/api/project/:projectId',
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.ProjectController.updateProject.bind(bottle.container.ProjectController),
  );
};
