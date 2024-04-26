import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import ProjectService from "../../../services/project.service";
import IssueService from "../../../services/issue.service";
import ErrorService from "../../../services/error.service";
import SegmentService from "../../../services/segment.service";
import { setTestEnvironmentVars } from "../helpers";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests getProject method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should successfully get project not assigned to user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "superadmin",
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectById").mockResolvedValueOnce({ 
      rows: [{ project_id: 1, source_word_count: 200, target_word_count: 300 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectUsersById").mockResolvedValueOnce({ 
      rows: [{ testUser: "test" }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getProjectIssuesById").mockResolvedValueOnce({ 
      rows: [
        {
          issue: "fluency", parent: "custom", name: "Fluency", description: "", notes: "", examples: "",
        },
        {
          issue: "custom", parent: null, name: "Custom", description: "", notes: "", examples: "",
        }
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValue({ 
      rows: [
        { issue: "custom", level: "critical", type: "source" },
        { issue: "custom", level: "minor", type: "target" },
        { issue: "fluency", level: "critical", type: "source" },
        { issue: "fluency", level: "minor", type: "target" },
      ], 
      command: "", 
      rowCount: 4, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsBySegmentId").mockResolvedValueOnce({ 
      rows: [
        {
          type: "source",
          test: "test",
        },
        {
          type: "target",
          test: "test",
        },
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(SegmentService.prototype, "getSegmentsByProjectId").mockResolvedValueOnce({ 
      rows: [{ id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.getProject(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      project: { project_id: 1, source_word_count: 200, target_word_count: 300 },
      apt: 52,
      report: {
        custom: [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 2],
        fluency: [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 2],
      },
      users: [{ testUser: "test" }],
      segments: [{
        id: 1,
        sourceErrors: [
          {
            type: "source",
            test: "test",
          },
        ],
        targetErrors: [
          {
            type: "target",
            test: "test",
          },
        ],
      }],
      issues: {
        custom:
        {
          issue: "custom",
          parent: null,
          name: "Custom",
          description: "",
          notes: "",
          examples: "",
          children: {
            fluency: {
              issue: "fluency",
              parent: "custom",
              name: "Fluency",
              description: "",
              notes: "",
              examples: "",
              children: {},
            },
          },
        },
      },
    });
  });

  it("should fail to get project not assigned to user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "user",
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectById").mockResolvedValueOnce({ 
      rows: [{ project_id: 1, source_word_count: 200, target_word_count: 300 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectUsersById").mockResolvedValueOnce({ 
      rows: [{ testUser: "test" }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getProjectIssuesById").mockResolvedValueOnce({ 
      rows: [
        {
          issue: "fluency", parent: "custom", name: "Fluency", description: "", notes: "", examples: "",
        },
        {
          issue: "custom", parent: null, name: "Custom", description: "", notes: "", examples: "",
        }
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [
        { issue: "custom", level: "critical", type: "source" },
        { issue: "custom", level: "minor", type: "target" },
        { issue: "fluency", level: "critical", type: "source" },
        { issue: "fluency", level: "minor", type: "target" },
      ], 
      command: "", 
      rowCount: 4, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsBySegmentId").mockResolvedValueOnce({ 
      rows: [
        {
          type: "source",
          test: "test",
        },
        {
          type: "target",
          test: "test",
        },
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(SegmentService.prototype, "getSegmentsByProjectId").mockResolvedValueOnce({ 
      rows: [{ id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.getProject(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Access Forbidden" 
    });
  });

  it("should successfully get project assigned to user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      role: "user",
      params: {
        projectId: "1",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectById").mockResolvedValueOnce({ 
      rows: [{ project_id: 1, source_word_count: 200, target_word_count: 300 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectUsersById").mockResolvedValueOnce({ 
      rows: [{ testUser: "test" }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getProjectIssuesById").mockResolvedValueOnce({ 
      rows: [
        {
          issue: "fluency", parent: "custom", name: "Fluency", description: "", notes: "", examples: "",
        },
        {
          issue: "custom", parent: null, name: "Custom", description: "", notes: "", examples: "",
        }
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValue({ 
      rows: [
        { issue: "custom", level: "critical", type: "source" },
        { issue: "custom", level: "minor", type: "target" },
        { issue: "fluency", level: "critical", type: "source" },
        { issue: "fluency", level: "minor", type: "target" },
      ], 
      command: "", 
      rowCount: 4, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsBySegmentId").mockResolvedValueOnce({ 
      rows: [
        {
          type: "source",
          test: "test",
        },
        {
          type: "target",
          test: "test",
        },
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(SegmentService.prototype, "getSegmentsByProjectId").mockResolvedValueOnce({ 
      rows: [{ id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.getProject(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      project: { project_id: 1, source_word_count: 200, target_word_count: 300 },
      apt: 52,
      report: {
        custom: [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 2],
        fluency: [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 2],
      },
      users: [{ testUser: "test" }],
      segments: [{
        id: 1,
        sourceErrors: [
          {
            type: "source",
            test: "test",
          },
        ],
        targetErrors: [
          {
            type: "target",
            test: "test",
          },
        ],
      }],
      issues: {
        custom:
        {
          issue: "custom",
          parent: null,
          name: "Custom",
          description: "",
          notes: "",
          examples: "",
          children: {
            fluency: {
              issue: "fluency",
              parent: "custom",
              name: "Fluency",
              description: "",
              notes: "",
              examples: "",
              children: {},
            },
          },
        },
      },
    });
  });
});
