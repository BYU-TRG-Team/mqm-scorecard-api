import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import SegmentService from "../../../services/segment.service";
import ProjectService from  "../../../services/project.service";
import IssueService from "../../../services/issue.service";
import { setTestEnvironmentVars } from "../helpers";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests deleteSegmentIssue method", () => {
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

    jest.spyOn(SegmentService.prototype, "getSegmentByIssueId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.SegmentController.deleteSegmentIssue(req, res);

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

    jest.spyOn(SegmentService.prototype, "getSegmentByIssueId").mockResolvedValueOnce({ 
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

    await bottle.container.SegmentController.deleteSegmentIssue(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should call deleteSegmentIssueById with errorId", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        errorId: "10",
      },
      role: "user",
    });

    jest.spyOn(IssueService.prototype, "deleteSegmentIssueById");
    jest.spyOn(SegmentService.prototype, "getSegmentByIssueId").mockResolvedValueOnce({ 
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

    await bottle.container.SegmentController.deleteSegmentIssue(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(IssueService.prototype.deleteSegmentIssueById).toHaveBeenCalledTimes(1);
    expect(IssueService.prototype.deleteSegmentIssueById).toHaveBeenCalledWith(req.params.issueId);
  });
});
