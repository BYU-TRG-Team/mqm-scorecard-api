import { getMockReq, getMockRes } from '@jest-mock/express';
import { constructBottle } from '../../../bottle';
import ProjectService from "../../../services/project.service";
import { setTestEnvironmentVars } from '../helpers';

jest.mock("pg");
jest.mock('nodemailer');

describe('tests getProjects method', () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it('should successfully return all projects', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'superadmin',

    });
    
    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [{ test: 'test' }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.getProjects(req, res);

    expect(ProjectService.prototype.getAllProjects).toHaveBeenCalledTimes(1);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      projects: [{ test: 'test' }] 
    });
  });

  it('should successfully return all projects for a specific user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'admin',
      userId: 1,
    });
    
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ test: 'test' }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.getProjects(req, res);

    expect(ProjectService.prototype.getProjectsByUserId).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.getProjectsByUserId).toHaveBeenCalledWith("1");

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      projects: [{ test: 'test' }] 
    });
  });
});
