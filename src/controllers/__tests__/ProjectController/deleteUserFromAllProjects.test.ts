import { getMockReq, getMockRes } from "@jest-mock/express";
import { setTestEnvironmentVars } from "../helpers";
import { constructBottle } from "../../../bottle";
import ProjectService from "../../../services/project.service";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests deleteUserFromAllProjects method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should successfully delete user from all projects", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "superadmin",
      params: {
        userId: "1",
      },
    });

    jest.spyOn(ProjectService.prototype, "deleteUserFromAllProjects");

    await bottle.container.ProjectController.deleteUserFromAllProjects(req, res);

    expect(ProjectService.prototype.deleteUserFromAllProjects).toHaveBeenCalledTimes(1);
    expect(ProjectService.prototype.deleteUserFromAllProjects).toHaveBeenCalledWith("1");

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
