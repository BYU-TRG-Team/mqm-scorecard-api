import ProjectController from '../../project.controller';
import { setTestEnvironmentVars } from '../helpers';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { constructBottle } from '../../../bottle';
import ProjectService from '../../../services/project.service';

jest.mock("pg");
jest.mock('nodemailer');

describe('tests deleteProject method', () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it('should successfully delete project not assigned to user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'superadmin',
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectController.prototype, 'isUserAssignedToProject');
    jest.spyOn(ProjectService.prototype, 'deleteProjectById');
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })

    await bottle.container.ProjectController.deleteProject(req, res);

    expect(ProjectController.prototype.isUserAssignedToProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.isUserAssignedToProject).toHaveBeenCalledWith(req, "2");

    expect(ProjectService.prototype.deleteProjectById).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.deleteProjectById).toHaveBeenCalledWith("2");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
    
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('should successfully delete project assigned to user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'admin',
      params: {
        projectId: "1",
      },
    });

    jest.spyOn(ProjectController.prototype, 'isUserAssignedToProject');
    jest.spyOn(ProjectService.prototype, 'deleteProjectById');
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.deleteProject(req, res);

    expect(ProjectController.prototype.isUserAssignedToProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.isUserAssignedToProject).toHaveBeenCalledWith(req, "1");

    expect(ProjectService.prototype.deleteProjectById).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.deleteProjectById).toHaveBeenCalledWith("1");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('should fail to delete project not assigned to user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'user',
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectController.prototype, 'isUserAssignedToProject');
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.deleteProject(req, res);

    expect(ProjectController.prototype.isUserAssignedToProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.isUserAssignedToProject).toHaveBeenCalledWith(req, "2");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Forbidden' });
  });
});
