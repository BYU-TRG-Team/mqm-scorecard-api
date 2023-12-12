import { setTestEnvironmentVars } from "../helpers";
import { constructBottle } from "../../../bottle";
import { getMockReq, getMockRes } from "@jest-mock/express";
import UserService from "../../../services/user.service";
import ProjectService from "../../../services/project.service";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests addUserToProject method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should fail due to invalid body", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      role: "superadmin",
      params: {
        projectId: "1",
      },
    });

    await bottle.container.ProjectController.addUserToProject(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: "Body must include a username",
    });
  });

  it("should fail with no user found", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
      },
      role: "superadmin",
      params: {
        projectId: "1",
      },
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.addUserToProject(req, res);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["username"],
      [req.body.username]
    );

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: `No user found with the username "${req.body.username}"`,
    });
  });

  it("should fail since user is already assigned", async () => {
    const bottle = constructBottle();
    const req = getMockReq({
      body: {
        username: "test",
      },
      role: "superadmin",
      params: {
        projectId: "1",
      },
    });
    const { res } = getMockRes({
      headersSent: true,
    });
  
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ user_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "mapUsertoProject").mockRejectedValueOnce({
      code: "23505",
    });

    await bottle.container.ProjectController.addUserToProject(req, res);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["username"],
      [req.body.username]
    );

    expect(ProjectService.prototype.mapUsertoProject).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.mapUsertoProject).toHaveBeenCalledWith("1", "1");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: `${req.body.username} has already been assigned to this project`,
    });
  });

  it("should successfully map user to project that is not assigned to it", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
      },
      role: "superadmin",
      params: {
        projectId: "1",
      },
    });

    jest.spyOn(ProjectService.prototype, "mapUsertoProject");
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ user_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.addUserToProject(req, res);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["username"],
      [req.body.username]
    );

    expect(ProjectService.prototype.mapUsertoProject).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.mapUsertoProject).toHaveBeenCalledWith("1", "1");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should fail to add user to project that is not assigned to project", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
      },
      role: "admin",
      params: {
        projectId: "1",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.addUserToProject(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Forbidden",
    });
  });

  it("should successfully map user to project that it is assigned to", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
      },
      role: "admin",
      params: {
        projectId: "1",
      },
    });
    
    jest.spyOn(ProjectService.prototype, "mapUsertoProject");
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ user_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.addUserToProject(req, res);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toBeCalledWith(
      ["username"],
      [req.body.username]
    );

    expect(ProjectService.prototype.mapUsertoProject).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.mapUsertoProject).toHaveBeenCalledWith("1", "1");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
