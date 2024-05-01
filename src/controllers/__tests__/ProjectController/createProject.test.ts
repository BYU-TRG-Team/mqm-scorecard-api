import { setTestEnvironmentVars } from "../helpers";
import { constructBottle } from "../../../bottle";
import { getMockReq, getMockRes } from "@jest-mock/express";
import IssueService from "../../../services/issue.service";
import ProjectController from "../../../controllers/project.controller";
import validBitextFile from "../../../testing/files/valid-bitext-file";
import metricFileWithNoIssues from "../../../testing/files/metric-file-no-issues";
import metricFileWithNoType from "../../../testing/files/metric-file-no-type";
import metricFileWithNoDisplay from "../../../testing/files/metric-file-no-display";
import metricFileTooDeep from "../../../testing/files/metric-file-too-deep";
import validMetricFile from "../../../testing/files/valid-metric-file";
import bitextFileWithErroredLine from "../../../testing/files/bitext-file-errored-line";
import bitextFileWithOneColumn from "../../../testing/files/bitext-file-one-column";
import validSpecificationsFile from "../../../testing/files/valid-specifications-file";
import emptyFile from "../../../testing/files/empty-file";
import DBClientPool from "../../../db-client-pool";
import ProjectService from "../../../services/project.service";
import ErrorService from "../../../services/error.service";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests createProject method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should throw a 400 error for non valid body", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: "test",
      },
      params: {
        projectId: "2",
      },
    });

    await bottle.container.ProjectController.createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Insufficient files submitted: Request requires a project name, metric file, and bi-text file" 
    });
  });

  // Metric file tests
  it("should throw a 400 error for invalid metric file (no issues)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: validBitextFile,
        metricFile: metricFileWithNoIssues,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });    

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "No issues found in metric file." 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 400 error for invalid metric file (no type)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: validBitextFile,
        metricFile: metricFileWithNoType,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });    

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing metric file: Error reading metric file: issue must have a type attribute" 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 400 error for invalid metric file (no display)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: validBitextFile,
        metricFile: metricFileWithNoDisplay,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });     

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing metric file: Error reading metric file: issue must have a display attribute" 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 400 error for invalid metric file (too deep)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: validBitextFile,
        metricFile: metricFileTooDeep,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });      

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing metric file: Error reading metric file: issues can not be more than three levels deep" 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 400 error for invalid metric file (empty)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: validBitextFile,
        metricFile: emptyFile,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "No issues found in metric file." 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Bitext file tests
  it("should throw a 400 error for invalid bitext file (error on line)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: bitextFileWithErroredLine,
        metricFile: validMetricFile,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing bi-text file: Error reading bitext file in line 3" 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 400 error for invalid bitext file (insufficient columns)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: bitextFileWithOneColumn,
        metricFile: validMetricFile,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing bi-text file: Error reading bitext file: File must have two or more columns" 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw a 400 error for invalid bitext file (empty)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: emptyFile,
        metricFile: validMetricFile,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });

    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing bi-text file: Error reading bitext file: File is blank" 
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should successfully create a new project and return a successful response", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: "test",
      },
      files: {
        bitextFile: validBitextFile,
        metricFile: validMetricFile,
        specificationsFile: validSpecificationsFile,
      },
      params: {
        projectId: "2",
      },
      role: "superadmin",
    });
    const issues: {[key: string]: any} = {
      typography: {
        parent: "fluency",
      },
      punctuation: {
        parent: "typography",
      },
      terminology: {
        parent: null,
      },
      termbase: {
        parent: "terminology",
      },
      "terminology-company": {
        parent: "termbase",
      },
      "terminology-third-party": {
        parent: "termbase",
      },
      "term-inconsistency": {
        parent: "terminology",
      },
      "multiple-terms-for-concept": {
        parent: "term-inconsistency",
      },
      "multiple-translations-of-term": {
        parent: "term-inconsistency",
      },
      "unpaired-marks": {
        parent: "typography",
      },
      whitespace: {
        parent: "typography",
      },
      orthography: {
        parent: "fluency",
      },
      spelling: {
        parent: "orthography",
      },
      "wrong-term": {
        parent: "terminology",
      },
      accuracy: {
        parent: null,
      },
      mistranslation: {
        parent: "accuracy",
      },
      "technical-relationship": {
        parent: "mistranslation",
      },
      "ambiguous-translation": {
        parent: "mistranslation",
      },
      "false-friend": {
        parent: "mistranslation",
      },
      "unit-conversion": {
        parent: "mistranslation",
      },
      number: {
        parent: "mistranslation",
      },
      "date-time": {
        parent: "mistranslation",
      },
      entity: {
        parent: "mistranslation",
      },
      "overly-literal": {
        parent: "mistranslation",
      },
      "over-translation": {
        parent: "accuracy",
      },
      "under-translation": {
        parent: "accuracy",
      },
      addition: {
        parent: "accuracy",
      },
      omission: {
        parent: "accuracy",
      },
      "omitted-variable": {
        parent: "omission",
      },
      "no-translate": {
        parent: "accuracy",
      },
      untranslated: {
        parent: "accuracy",
      },
      "untranslated-graphic": {
        parent: "untranslated",
      },
      fluency: {
        parent: null,
      },
      grammar: {
        parent: "fluency",
      },
      "word-form": {
        parent: "grammar",
      },
      "part-of-speech": {
        parent: "word-form",
      },
      "tense-mood-aspect": {
        parent: "word-form",
      },
      agreement: {
        parent: "word-form",
      },
      "word-order": {
        parent: "grammar",
      },
      "function-words": {
        parent: "grammar",
      },
      diacritics: {
        parent: "orthography",
      },
      transliteration: {
        parent: "orthography",
      },
      capitalization: {
        parent: "orthography",
      },
      compounding: {
        parent: "orthography",
      },
      "title-style": {
        parent: "orthography",
      },
      "corpus-conformance": {
        parent: "fluency",
      },
      "pattern-problem": {
        parent: "fluency",
      },
      duplication: {
        parent: "fluency",
      },
    };

    jest.spyOn(DBClientPool.prototype, "beginTransaction");
    jest.spyOn(DBClientPool.prototype, "commitTransaction");
    jest.spyOn(ProjectController.prototype, "upsertProject");
    jest.spyOn(ProjectService.prototype, "createProject").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getAllIssues").mockResolvedValueOnce({ 
      rows: ["test"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getIssueById").mockImplementation((issue: string) => { 
      return new Promise((resolve) => {
        return resolve({
          rows: [issues[issue]],
          command: "", 
          rowCount: 1, 
          oid: 0, 
          fields: [] 
        });
      });
    });
    jest.spyOn(ErrorService.prototype, "getErrorsByProjectId").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.ProjectController.createProject(req, res);

    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledTimes(1);
    expect(ProjectController.prototype.upsertProject).toHaveBeenCalledWith(req, res);

    expect(DBClientPool.prototype.beginTransaction).toHaveBeenCalledTimes(1);
    
    expect(DBClientPool.prototype.commitTransaction).toHaveBeenCalledTimes(1);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Project created successfully." 
    });
  });
});
