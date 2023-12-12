import { setTestEnvironmentVars } from "../helpers";
import ProjectService from "../../../services/project.service";
import { constructBottle } from "../../../bottle";
import { getMockReq, getMockRes } from "@jest-mock/express";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests deleteUserFromProject method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should successfully delete project that is not assigned to the user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "superadmin",
      params: {
        projectId: "2",
        userId: "1",
      },
    });

    jest.spyOn(ProjectService.prototype, "deleteUserFromProject");
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.deleteUserFromProject(req, res);

    expect(ProjectService.prototype.deleteUserFromProject).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.deleteUserFromProject).toHaveBeenCalledWith("1", "2");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should successfully delete project that is assigned to the user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "user",
      params: {
        projectId: "1",
        userId: "1",
      },
    });
    
    jest.spyOn(ProjectService.prototype, "deleteUserFromProject");
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.deleteUserFromProject(req, res);

    expect(ProjectService.prototype.deleteUserFromProject).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.deleteUserFromProject).toHaveBeenCalledWith("1","1");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should fail to delete project that is not assigned to the user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "user",
      params: {
        projectId: "2",
        userId: "1",
      },
    });
    
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.deleteUserFromProject(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
    
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Forbidden",
    });
  });
});
