import { parseStringPromise as parseXML } from "xml2js";
import errorMessages from '../messages/errors.messages';
import DBClientPool from "../db-client-pool";
import UserService from "../services/user.service";
import FileParser from "../support/fileparser.support";
import ProjectService from "../services/project.service";
import IssueService from "../services/issue.service";
import SegmentService from "../services/segment.service";
import IssueParser from "../support/issueparser.support";
import { Logger } from "winston";
import { Request, Response } from "express";
import { isError } from "../type-guards";
import { PoolClient } from "pg";

class ProjectController {
  constructor(
    private readonly dbClientPool: DBClientPool, 
    private readonly userService: UserService, 
    private readonly fileParser: FileParser, 
    private readonly projectService: ProjectService, 
    private readonly issueService: IssueService, 
    private readonly segmentService: SegmentService, 
    private readonly issueParser: IssueParser, 
    private readonly logger: Logger
  ) {}

  /*
  * POST /api/project
  * @bitextFile
  * @metricFile
  * @specificationsFile
  * @name
  */
  async createProject(req: Request, res: Response) {
    if (
      !req.files || 
      !req.files.bitextFile || 
      Array.isArray(req.files.bitextFile) ||
      !req.files.metricFile ||
      Array.isArray(req.files.metricFile) || 
      !req.body.name
    ) {
      return res.status(400).json({ 
        message: 'Insufficient files submitted: Request requires a project name, metric file, and bi-text file' 
      });
    }

    try {
      await this.upsertProject(req, res);
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

  /*
  * GET /api/projects
  */
  async getProjects(req: Request, res: Response) {
    try {
      let projectResponse;

      if (req.role === 'superadmin') {
        projectResponse = await this.projectService.getAllProjects();
      } else {
        projectResponse = await this.projectService.getProjectsByUserId(String(req.userId));
      }

      return res.json({
        projects: projectResponse.rows 
      });
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

  /*
  * DELETE /api/project/:projectId
  */
  async deleteProject(req: Request, res: Response) {
    try {
      if (!await this.isUserAssignedToProject(req, req.params.projectId)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }
      
      await this.projectService.deleteProjectById(req.params.projectId);
      return res.status(204).send();
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

  /*
  * GET /api/project/:projectId
  */
  async getProject(req: Request, res: Response) {
    try {
      if (!await this.isUserAssignedToProject(req, req.params.projectId)) {
        return res.status(403).json({
          message: errorMessages.accessForbidden 
        });
      }

      const projectResponse = await this.projectService.getProjectById(req.params.projectId);
      const project = projectResponse.rows[0];
      const projectUserResponse = await this.projectService.getProjectUsersById(project.project_id);
      const projectSegmentsResponse = await this.segmentService.getSegmentsByProjectId(project.project_id);
      const issueResponse = await this.issueService.getProjectIssuesById(project.project_id);
      const report = await this.createReport(project.project_id);

      // Organize segment errors by source and target
      for (let i = 0; i < projectSegmentsResponse.rows.length; ++i) {
        const { id } = projectSegmentsResponse.rows[i];
        const segmentIssues = await this.issueService.getSegmentIssuesBySegmentId(id);
        const sourceIssues = segmentIssues.rows.filter((issue) => issue.type === 'source');
        const targetIssues = segmentIssues.rows.filter((issue) => issue.type === 'target');
        projectSegmentsResponse.rows[i].sourceErrors = sourceIssues;
        projectSegmentsResponse.rows[i].targetErrors = targetIssues;
      }

      return res.json({
        project,
        report,
        users: projectUserResponse.rows,
        segments: projectSegmentsResponse.rows,
        issues: this.issueParser.parseIssues(issueResponse.rows),
        apt: await this.calculateApt(req.params.projectId),
      });
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

  /*
  * GET /api/project/:projectId/report
  */
  async getProjectJSONReport(req: Request, res: Response) {
    try {
      if (!await this.isUserAssignedToProject(req, req.params.projectId)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      const metric = (await this.issueService.getProjectIssuesById(req.params.projectId)).rows;

      // Maps metric to JSON format required by Python app
      const metricJSONTranslator = (rawMetric: any) => {
        const translator = {
          to: 'issueId',
          from: 'issue',
        };

        const translateIssue = (issue: any) => {
          if (issue[translator.from]) {
            issue[translator.to] = issue[translator.from];
            delete issue[translator.from];
          }
        };

        rawMetric.forEach((issue: any) => translateIssue(issue));
      };

      metricJSONTranslator(metric);

      const projectResponse = await this.projectService.getProjectById(req.params.projectId);
      const projectSegmentsResponse = await this.segmentService.getSegmentsByProjectId(req.params.projectId);
      const projectSegmentIssuesResponse = await this.issueService.getSegmentIssuesByProjectId(req.params.projectId);
      const apt = await this.calculateApt(req.params.projectId);
      const { name } = projectResponse.rows[0];
      const key: {[key: string]: any} = {};

      projectSegmentsResponse.rows.forEach((seg: any) => {
        key[seg.id] = String(seg.segment_num);
      });

      return res.json({
        projectName: name,
        key,
        errors: projectSegmentIssuesResponse.rows.map((segmentIssue) => (
          {
            segment: String(segmentIssue.segment_id),
            target: segmentIssue.type,
            name: segmentIssue.issue_name,
            severity: segmentIssue.level,
            issueReportId: String(segmentIssue.id),
            issueId: segmentIssue.issue,
            note: segmentIssue.note,
            highlighting: {
              startIndex: segmentIssue.highlight_start_index,
              endIndex: segmentIssue.highlight_end_index,
            },
          }
        )),
        metric,
        apt,
        segments: {
          source: projectSegmentsResponse.rows.map((seg) => seg.segment_data.Source),
          target: projectSegmentsResponse.rows.map((seg) => seg.segment_data.Target),
        },
      });
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

  /*
  * DELETE /api/project/:projectId/user/:userId
  */

  async deleteUserFromProject(req: Request, res: Response) {
    const { projectId, userId } = req.params;

    try {
      if (!await this.isUserAssignedToProject(req, req.params.projectId)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      await this.projectService.deleteUserFromProject(userId, projectId);
      return res.status(204).send();
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

  /*
  * DELETE /api/user/:userId/projects
  */
  async deleteUserFromAllProjects(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      await this.projectService.deleteUserFromAllProjects(userId);
      return res.status(204).send();
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

  /*
  * POST /api/project/:projectId/user
  * @username
  */
  async addUserToProject(req: Request, res: Response) {
    let user;
    const { username } = req.body;
    const { projectId } = req.params;

    if (username === undefined) {
      return res.status(400).json({ 
        message: 'Body must include a username' 
      });
    }

    try {
      if (!await this.isUserAssignedToProject(req, projectId)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      const userResponse = await this.userService.findUsers(['username'], [username]);

      if (userResponse.rows.length === 0) {
        return res.status(404).json({ 
          message: `No user found with the username "${username}"` 
        });
      }

      user = userResponse.rows[0];
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
      await this.projectService.mapUsertoProject(projectId, String(user.user_id));
      return res.status(204).send();
    } catch (err: any) {
      if (err.code === '23505') {
        return res.status(409).json({ 
          message: `${username} has already been assigned to this project` 
        });
      }

      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).json({ 
        message: errorMessages.generic 
      });
    }
  }

  /*
  * PUT /api/project/:projectId
  * @bitextFile
  * @metricFile
  * @specificationsFile
  * @name
  * @finished
  * @segmentNum
  */
  async updateProject(req: Request, res: Response) {
    try {
      if (!await this.isUserAssignedToProject(req, req.params.projectId)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      return this.upsertProject(req, res, true);
    } catch (err) {
      if (isError(err)) {
        this.logger.log({
          level: "error",
          message: err.message,
        });
      }

      return res.status(500).send({ 
        message: errorMessages.generic
      })
    }
  }

  async upsertProject(req: Request, res: Response, isUpdate = false) {
    let dbTXNClient: PoolClient;
    let bitextFile;
    let metricFile;
    let parsedMetricFile;
    let specificationsFile;
    let parsedSpecificationsFile;
    let specifications = '';
    let metric = new Array<any>();
    let segments = new Array<any>();
    let sourceWordCount = 0;
    let targetWordCount = 0;
    let projectId;
    const isAdmin = ['superadmin', 'admin'].includes(req.role);
    const { name, finished, segmentNum } = req.body;
    const newProjectAttributes = new Array<any>();
    const newProjectValues = new Array<any>();

    if (req.params && req.params.projectId) {
      projectId = req.params.projectId;
    }

    if (req.files) {
      bitextFile = req.files.bitextFile;
      metricFile = req.files.metricFile;
      specificationsFile = req.files.specificationsFile;
    }

    try {
      if (!await this.isTypologyImported()) {
        return res.status(400).json({ 
          message: 'Typology not yet imported. Please contact an administrator for help.' 
        });
      }

      const hasSegmentIssues = projectId && await this.hasSegmentIssues(projectId);

      if ((metricFile !== undefined || bitextFile !== undefined) && hasSegmentIssues) {
        return res.status(400).json({ 
          message: 'Changing the bi-text or metric files is not possible until all reported issues are removed.' 
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

    if (name !== undefined && isAdmin) {
      newProjectAttributes.push('name');
      newProjectValues.push(name);
    }

    if (finished !== undefined) {
      newProjectAttributes.push('finished');
      newProjectValues.push(finished);
    }

    if (segmentNum !== undefined) {
      newProjectAttributes.push('last_segment');
      newProjectValues.push(segmentNum);
    }
    
    if (metricFile !== undefined && isAdmin && !Array.isArray(metricFile)) {
      newProjectAttributes.push('metric_file');
      newProjectValues.push(metricFile.name);

      try {
        parsedMetricFile = await parseXML(
          metricFile.data.toString()
        )
      } catch(err) {
        let errMessage = isError(err) ? err.message : "";

        return res.status(400).json({ 
          message: `Problem parsing metric file: ${errMessage}` 
        });
      }

      if (!parsedMetricFile || !parsedMetricFile.issues || !parsedMetricFile.issues.issue) {
        return res.status(400).json({
          message: 'No issues found in metric file.' 
        });
      }

      const [metricFileResponseErr, metricFileResponse] = this.fileParser.parseMetricFile(parsedMetricFile.issues, null);

      if (metricFileResponseErr) {
        return res.status(400).json({ 
          message: `Problem parsing metric file: ${metricFileResponseErr}`
        });
      }

      metric = metricFileResponse;
    }

    if (bitextFile !== undefined && isAdmin && !Array.isArray(bitextFile)) {
      const [
        bitextFileResponseErr, 
        bitextFileResponse
      ] = this.fileParser.parseBiColumnBitext(
        bitextFile.data.toString()
      );

      if (bitextFileResponseErr) {
        return res.status(400).json({ 
          message: `Problem parsing bi-text file: ${bitextFileResponseErr}`
        });
      }

      segments = bitextFileResponse.segments;
      sourceWordCount = bitextFileResponse.sourceWordCount;
      targetWordCount = bitextFileResponse.targetWordCount;
      newProjectAttributes.push('bitext_file');
      newProjectValues.push(bitextFile.name);
      newProjectAttributes.push('last_segment');
      newProjectValues.push(1);
      newProjectAttributes.push('source_word_count');
      newProjectValues.push(sourceWordCount);
      newProjectAttributes.push('target_word_count');
      newProjectValues.push(targetWordCount);
    }

    if (specificationsFile !== undefined && isAdmin && !Array.isArray(specificationsFile)) {
      try {
        parsedSpecificationsFile = await parseXML(specificationsFile.data.toString())
      } catch(err) {
        let errMessage = isError(err) ? err.message : "";

        return res.status(400).json({ 
          message:  `Problem parsing specifications file: ${errMessage}`
        });
      }

      const [
        specificationsFileResponseErr, 
        specificationsFileResponse
      ] = this.fileParser.parseSpecificationsFile(parsedSpecificationsFile);

      if (specificationsFileResponseErr) {
        return res.status(400).json({ 
          message: `Problem parsing specifications file: ${specificationsFileResponseErr }`
        });
      }

      specifications = specificationsFileResponse;
      newProjectAttributes.push('specifications_file');
      newProjectValues.push(specificationsFile.name);
      newProjectAttributes.push('specifications');
      newProjectValues.push(specifications);
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
      if (
        !isUpdate && 
        metricFile && 
        !Array.isArray(metricFile) && 
        bitextFile && 
        !Array.isArray(bitextFile) && 
        !Array.isArray(specificationsFile)
      ) {
        const newProject = await this.projectService.createProject(
          name, 
          specificationsFile ? specificationsFile.name : '', 
          specifications, 
          metricFile.name, 
          bitextFile.name, 
          sourceWordCount, 
          targetWordCount, 
          dbTXNClient
        );

        projectId = newProject.rows[0].project_id;
        await this.projectService.mapUsertoProject(
          projectId, 
          String(req.userId), 
          dbTXNClient
        );
      }

      if (metricFile !== undefined && isAdmin) {
        // Save issues from metric file
        for (let i = 0; i < metric.length; ++i) {
          const selectedIssue = metric[i];
          const issueResponse = await this.issueService.getIssueById(selectedIssue.issue, dbTXNClient);

          if (issueResponse.rows.length === 0) {
            await this.dbClientPool.rollbackTransaction(dbTXNClient);
            return res.status(400).json({ 
              message: `Issue type "${selectedIssue.issue}" does not exist in the typology` 
            });
          }

          if (issueResponse.rows[0].parent !== selectedIssue.parent) {
            await this.dbClientPool.rollbackTransaction(dbTXNClient);
            return res.status(400).json({
              message: `Issue type "${selectedIssue.issue}" does not have the parent issue type "${selectedIssue.parent}"` 
            });
          }

          await this.issueService.createProjectIssue(
            projectId, 
            selectedIssue.issue, 
            selectedIssue.display, 
            dbTXNClient
          );
        }
      }

      if (bitextFile !== undefined && isAdmin) {
        if (isUpdate) {
          await this.segmentService.deleteSegments(
            ['project_id'], 
            [projectId], 
            dbTXNClient
          );
        }

        await this.segmentService.createSegments(
          segments, 
          projectId, 
          dbTXNClient
        );
      }

      if (isUpdate) {
        await this.projectService.setProjectAttributes(
          newProjectAttributes, 
          newProjectValues, 
          projectId,
          dbTXNClient
        );
      }

      await this.dbClientPool.commitTransaction(dbTXNClient);
      const message = isUpdate ? 'Project updated successfully.' : 'Project created successfully.';
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

  async isUserAssignedToProject(req: Request, projectId: string) {
    if (req.role === 'superadmin') {
      return true;
    }

    const userProjectsResponse = await this.projectService.getProjectsByUserId(String(req.userId));
    return userProjectsResponse.rows.filter((proj) => Number(proj.project_id) === Number(projectId)).length > 0
  }

  async isTypologyImported() {
    const issueResponse = await this.issueService.getAllIssues();
    return issueResponse.rows.length > 0;
  }

  async hasSegmentIssues(projectId: any) {
    const projectSegmentsResponse = await this.segmentService.getSegmentsByProjectId(projectId);

    for (let i = 0; i < projectSegmentsResponse.rows.length; ++i) {
      const { id } = projectSegmentsResponse.rows[i];
      const segmentIssues = await this.issueService.getSegmentIssuesBySegmentId(id);

      if (segmentIssues.rows.length > 0) {
        return true;
      }
    }

    return false;
  }

  async createReport(projectId: any) {
    const reportResponse = await this.issueService.getProjectReportById(projectId);
    const report: {[key: string]: any} = {};

    reportResponse.rows.forEach((issue) => {
      const sourceNetural = issue.level.filter((level: any, index: any) => level === 'neutral' && issue.type[index] === 'source').length;
      const sourceMinor = issue.level.filter((level: any, index: any) => level === 'minor' && issue.type[index] === 'source').length;
      const sourceMajor = issue.level.filter((level: any, index: any) => level === 'major' && issue.type[index] === 'source').length;
      const sourceCritical = issue.level.filter((level: any, index: any) => level === 'critical' && issue.type[index] === 'source').length;

      const targetNetural = issue.level.filter((level: any, index: any) => level === 'neutral' && issue.type[index] === 'target').length;
      const targetMinor = issue.level.filter((level: any, index: any) => level === 'minor' && issue.type[index] === 'target').length;
      const targetMajor = issue.level.filter((level: any, index: any) => level === 'major' && issue.type[index] === 'target').length;
      const targetCritical = issue.level.filter((level: any, index: any) => level === 'critical' && issue.type[index] === 'target').length;

      report[issue.issue] = [
        // Source issues
        sourceNetural,
        sourceMinor,
        sourceMajor,
        sourceCritical,
        sourceNetural + sourceMinor + sourceMajor + sourceCritical,
        // Target issues
        targetNetural,
        targetMinor,
        targetMajor,
        targetCritical,
        targetNetural + targetMinor + targetMajor + targetCritical,
        sourceNetural + sourceMinor + sourceMajor + sourceCritical + targetNetural + targetMinor + targetMajor + targetCritical,
      ];
    });

    return report;
  }

  async calculateApt(projectId: any) {
    let apt = 0;
    const reportResponse = await this.issueService.getProjectReportById(projectId);
    const severityWeights: {[key: string]: any} = {
      neutral: 0,
      minor: 1,
      major: 5,
      critical: 25,
    };

    reportResponse.rows.forEach((issue) => {
      issue.level.forEach((level: any) => {
        if (level !== null) {
          apt += severityWeights[level];
        }
      });
    });

    return apt;
  }
}

export default ProjectController;
