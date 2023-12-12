import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import { setTestEnvironmentVars } from "../helpers";
import ProjectService from "../../../services/project.service";
import typologyFileWithNoTypology from "../../../testing/files/typology-file-no-typology";
import typologyFileWithNoName from "../../../testing/files/typology-file-no-name";
import typologyFileWithNoId from "../../../testing/files/typology-file-no-id";
import validTypologyFile from "../../../testing/files/valid-typology-file";
import validTypologyFileParsed from "../../../testing/files/valid-typology-file--parsed";
import emptyFile from "../../../testing/files/empty-file";
import DBClientPool from "../../../db-client-pool";
import IssueService from "../../../services/issue.service";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests updateTypology method", () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it("should throw a 400 error for an invalid body", async () => {
    const bottle = constructBottle();
    const req = getMockReq();
    const { res } = getMockRes();
         
    await bottle.container.IssueController.updateTypology(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({ 
      message: "Body must include a typology file" 
    });
  });

  it("should throw a 400 error due to project existence", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: validTypologyFile,
      },
    });

    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [{}], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.IssueController.updateTypology(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({ 
      message: "All projects must be deleted before importing a new typology" 
    });
  });

  it("should throw a 400 error due to invalid file (no typology element)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: typologyFileWithNoTypology,
      },
    });

    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.IssueController.updateTypology(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing typology file: No typology element found" 
    });
  });

  it("should throw a 400 error due to invalid file (empty file)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: emptyFile,
      },
    });
      
    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });
  
    await bottle.container.IssueController.updateTypology(req, res);
  
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing typology file: No typology element found" 
    });
  });

  it("should throw a 400 error due to invalid file (no name attribute on errorType)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: typologyFileWithNoName,
      },
    });

    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.IssueController.updateTypology(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({ 
      message: "Problem parsing typology file: Error reading typology file: error type must have a name attribute" 
    });
  });

  it("should throw a 400 error due to invalid file (no id attribute on errorType)", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: typologyFileWithNoId,
      },
    });

    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.IssueController.updateTypology(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Problem parsing typology file: Error reading typology file: error type must have an id attribute" 
    });
  });

  it("should successfully parse typology file and start/end transaction that creates each error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: validTypologyFile,
      },
    });

    jest.spyOn(DBClientPool.prototype, "beginTransaction");
    jest.spyOn(DBClientPool.prototype, "commitTransaction");
    jest.spyOn(IssueService.prototype, "deleteIssues");
    jest.spyOn(IssueService.prototype, "createIssue");
    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.IssueController.updateTypology(req, res);

    expect(DBClientPool.prototype.beginTransaction).toHaveBeenCalledTimes(1);
      
    expect(DBClientPool.prototype.commitTransaction).toHaveBeenCalledTimes(1);
      
    expect(res.status).toHaveBeenCalledTimes(0);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "The following issue types have been created: Terminology, inconsistent with terminology resource, organization terminology, third-party terminology, inconsistent use of terminology, multiple terms in source, multiple terms in translation, wrong term, Accuracy, mistranslation, mistranslation of technical relationship, ambiguous translation, false friend, unit conversion, number, date/time, entity, overly literal, overtranslation, undertranslation, addition, omission, omitted variable, do not translate, untranslated, untranslated graphic, Linguistic Conventions, grammar, word form, part of speech, tense/mood/aspect, agreement, word order, function words, typography, punctuation, unpaired quote marks or brackets, whitespace, orthography, spelling, diacritics, transliteration, capitalization, compounding, title style, corpus conformance, pattern problem, duplication" 
    });

    expect(IssueService.prototype.deleteIssues).toHaveBeenCalledTimes(1);
      
    expect(IssueService.prototype.createIssue).toHaveBeenCalledTimes(validTypologyFileParsed.length);
    (IssueService.prototype.createIssue as jest.Mock).mock.calls.forEach((mockCall) => {
      const mockedError = validTypologyFileParsed.filter((error) => error.id === mockCall[0])[0];

      expect(mockedError).not.toStrictEqual(undefined);
      expect(mockedError.id).toStrictEqual(mockCall[0]);
      expect(mockedError.parent).toStrictEqual(mockCall[1]);
      expect(mockedError.name).toStrictEqual(mockCall[2]);
      expect(mockedError.description).toStrictEqual(mockCall[3]);
      expect(mockedError.notes).toStrictEqual(mockCall[4]);
      expect(mockedError.examples).toStrictEqual(mockCall[5]);
      expect(mockCall[6]).not.toStrictEqual(undefined);
    });
  });

  it("should throw a 500 error and rollback the db", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      files: {
        typologyFile: validTypologyFile,
      },
    });

    jest.spyOn(DBClientPool.prototype, "beginTransaction");
    jest.spyOn(DBClientPool.prototype, "rollbackTransaction");
    jest.spyOn(IssueService.prototype, "createIssue").mockImplementationOnce(() => { throw Error; });
    jest.spyOn(ProjectService.prototype, "getAllProjects").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });


    await bottle.container.IssueController.updateTypology(req, res);

    expect(DBClientPool.prototype.beginTransaction).toHaveBeenCalledTimes(1);

    expect(DBClientPool.prototype.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Something went wrong on our end. Please try again." 
    });
  });
});
