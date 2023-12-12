import { parseStringPromise as parseXML } from "xml2js";
import xmlBuilder from 'xmlbuilder';
import errorMessages from '../messages/errors.messages';
import IssueService from "../services/issue.service";
import ProjectService from "../services/project.service";
import FileParser from "../support/fileparser.support";
import IssueParser from "../support/issueparser.support";
import DBClientPool from "../db-client-pool";
import { Logger } from "winston";
import { isError } from "../type-guards";
import { PoolClient } from "pg";
import { Request, Response } from "express";

class IssueController {
  constructor(
    private readonly issueService: IssueService, 
    private readonly projectService: ProjectService, 
    private readonly fileParser: FileParser,
    private readonly issueParser: IssueParser,
    private readonly dbClientPool: DBClientPool, 
    private readonly logger: Logger
  ) {}

  /*
  * POST /api/issues
  * @typologyFile
  */
  async updateTypology(req: Request, res: Response) {
    let dbTXNClient: PoolClient;
    let parsedTypologyFile;
    const newIssueTypes = new Array<any>();

    if (!req.files || !req.files.typologyFile || Array.isArray(req.files.typologyFile)) {
      return res.status(400).json({ 
        message: 'Body must include a typology file' 
      });
    }

    try {
      const projectResponse = await this.projectService.getAllProjects();

      if (projectResponse.rows.length !== 0) {
        return res.status(400).json({ 
          message: 'All projects must be deleted before importing a new typology' 
        });
      }
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }

    try {
      parsedTypologyFile = await parseXML(req.files.typologyFile.data.toString());

      if (!parsedTypologyFile || !parsedTypologyFile.typology) {
        throw new Error("No typology element found")
      }
    } catch (err) {
      let errMessage = isError(err) ? err.message : "";
      
      return res.status(400).json({ 
        message: `Problem parsing typology file: ${errMessage}` 
      });
    }

    try {
      dbTXNClient = await this.dbClientPool.beginTransaction();
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }

    try {
      const [
        typologyFileResponseErr, 
        typologyFileResponse
      ] = this.fileParser.parseTypologyFile(parsedTypologyFile.typology);

      if (typologyFileResponseErr) {
        return res.status(400).json({ 
          message: `Problem parsing typology file: ${typologyFileResponseErr}`
        });
      }

      // Delete all issues
      await this.issueService.deleteIssues([], [], dbTXNClient);

      for (let i = 0; i < typologyFileResponse.length; ++i) {
        const selectedIssueType = typologyFileResponse[i];
        const {
          id, parent, name, description, notes, examples,
        } = selectedIssueType;

        newIssueTypes.push(name);
        await this.issueService.createIssue(
          id, 
          parent, 
          name, 
          description, 
          notes, 
          examples, 
          dbTXNClient
        );
      }

      let message = 'The following issue types have been created: ';
      newIssueTypes.forEach((issueType, index) => {
        if (index > 0) {
          message += `, `;
        }

        message += `${issueType}`;
      });

      await this.dbClientPool.commitTransaction(dbTXNClient);
      return res.json({ message });
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      await this.dbClientPool.rollbackTransaction(dbTXNClient);
      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }
  }

  /*
  * GET /api/issues
  * @typologyFile
  */

  async getTypology(_req: Request, res: Response) {
    try {
      const issueResponse = await this.issueService.getAllIssues();
      const parsedIssues = this.issueParser.parseIssues(issueResponse.rows);
      const baseXml = xmlBuilder.create('typology');
      const recursiveIssueBuilder = ({
        issue, name, description, notes, examples, children,
      }: {
        issue: any, name: any, description: any, notes: any, examples: any, children: any,
      }, xml: any, level = 0) => {
        const issueElement = xml.ele('errorType');
        issueElement.att('name', name);
        issueElement.att('id', issue);
        issueElement.att('level', level);
        issueElement.ele('description', {}, description);
        issueElement.ele('notes', {}, notes);
        issueElement.ele('examples', {}, examples);

        Object.keys(children).forEach((c) => recursiveIssueBuilder(children[c], issueElement, level + 1));
      };

      Object.keys(parsedIssues).forEach((ele) => recursiveIssueBuilder(parsedIssues[ele], baseXml));
      res.set('Content-Type', 'text/xml');
      return res.send(baseXml.end({ pretty: true }));
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic
      });
    }
  }
}

export default IssueController;
