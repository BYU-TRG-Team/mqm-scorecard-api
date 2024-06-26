import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import SegmentService from "../../../services/segment.service";
import ProjectService from "../../../services/project.service";
import { setTestEnvironmentVars } from "../helpers";
import ErrorService from "../../../services/error.service";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests createError method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should throw a 400 error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        note: "test",
        highlighting: "test",
        issue: "test",
        level: "test",
        type: "test",
        highlightStartIndex: "test",
      },
      params: {
        segmentId: "10",
      },
      role: "user",
    });

    await bottle.container.SegmentController.createError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 404 error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        note: "test",
        highlighting: "test",
        issue: "test",
        level: "test",
        type: "test",
        highlightStartIndex: "test",
        highlightEndIndex: "test",
      },
      params: {
        segmentId: "10",
      },
      role: "user",
    });

    jest.spyOn(SegmentService.prototype, "getSegmentById").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.SegmentController.createError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should throw a 403 error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        note: "test",
        highlighting: "test",
        issue: "test",
        level: "test",
        type: "test",
        highlightStartIndex: "test",
        highlightEndIndex: "test",
      },
      params: {
        segmentId: "10",
      },
      role: "user",
    });

    jest.spyOn(SegmentService.prototype, "getSegmentById").mockResolvedValueOnce({ 
      rows: [{ project_id: 10 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(SegmentService.prototype, "getSegmentById").mockResolvedValueOnce({ 
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

    await bottle.container.SegmentController.createError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should call addError with segmentId, note, highlighting, issue, level, type, highlightStartIndex, highlightEndIndex", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        note: "test note",
        highlighting: "tes highlighting",
        issue: "test issue",
        level: "test level ",
        type: "test type",
        highlightStartIndex: "0",
        highlightEndIndex: "10",
      },
      params: {
        segmentId: "10",
      },
      role: "user",
    });
    
    jest.spyOn(ErrorService.prototype, "addError");
    jest.spyOn(SegmentService.prototype, "getSegmentById").mockResolvedValueOnce({ 
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

    await bottle.container.SegmentController.createError(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(ErrorService.prototype.addError).toHaveBeenCalledTimes(1);
    expect(ErrorService.prototype.addError).toHaveBeenCalledWith(
      "10", 
      req.body.note, 
      req.body.highlighting, 
      req.body.issue, 
      req.body.level, 
      req.body.type, 
      req.body.highlightStartIndex, 
      req.body.highlightEndIndex
    );
  });
});
