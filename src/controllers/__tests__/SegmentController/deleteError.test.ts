import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import SegmentService from "../../../services/segment.service";
import ProjectService from  "../../../services/project.service";
import { setTestEnvironmentVars } from "../helpers";
import ErrorService from "../../../services/error.service";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests deleteError method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should throw a 404 error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        errorId: "10",
      },
      role: "user",
    });

    jest.spyOn(SegmentService.prototype, "getSegmentByErrorId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.SegmentController.deleteError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should throw a 403 error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        errorId: "10",
      },
      role: "user",
    });

    jest.spyOn(SegmentService.prototype, "getSegmentByErrorId").mockResolvedValueOnce({ 
      rows: [{ project_id: 10 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 11 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.SegmentController.deleteError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should call deleteErrorById with errorId", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        errorId: "10",
      },
      role: "user",
    });

    jest.spyOn(ErrorService.prototype, "deleteErrorById");
    jest.spyOn(SegmentService.prototype, "getSegmentByErrorId").mockResolvedValueOnce({ 
      rows: [{ project_id: 10 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 10 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.SegmentController.deleteError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(ErrorService.prototype.deleteErrorById).toHaveBeenCalledTimes(1);
    expect(ErrorService.prototype.deleteErrorById).toHaveBeenCalledWith(req.params.errorId);
  });
});
