import { Logger } from "winston";
import errorMessages from "../messages/errors.messages";
import IssueService from "../services/issue.service";
import ProjectService from "../services/project.service";
import SegmentService from "../services/segment.service";
import { Request, Response } from "express";
import { isError } from "../type-guards";

class SegmentController {
  constructor(
    private readonly segmentService: SegmentService, 
    private readonly projectService: ProjectService, 
    private readonly issueService: IssueService, 
    private readonly logger: Logger
  ) {}

  /*
  * POST /api/segment/:segmentId/error
  * @note
  * @highlighting
  * @issue
  * @level
  * @type
  * @highlightStartIndex
  * @highlightEndIndex
  */
  async createSegmentIssue(req: Request, res: Response) {
    const {
      note, 
      highlighting, 
      issue, 
      level, 
      type, 
      highlightStartIndex,
      highlightEndIndex,
    } = req.body;

    if (note === undefined || highlighting === undefined || issue === undefined || level === undefined || type === undefined || highlightStartIndex === undefined || highlightEndIndex === undefined) {
      return res.status(400).send({ 
        message: "Body must include note, highlighting, issue, level, type, highlightStartIndex, and highlightEndIndex" 
      });
    }

    try {
      const segmentResponse = await this.segmentService.getSegmentById(req.params.segmentId);

      if (segmentResponse.rows.length === 0) {
        return res.status(404).send({ 
          message: "No segment found" 
        });
      }

      const segment = segmentResponse.rows[0];

      if (!await this.isUserAssignedToProject(req, segment.project_id)) {
        return res.status(403).json({
          message: errorMessages.accessForbidden 
        });
      }

      await this.issueService.addSegmentIssue(req.params.segmentId, note, highlighting, issue, level, type, highlightStartIndex, highlightEndIndex);
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
  * DELETE /api/segment/error/:issueId
  */
  async deleteSegmentIssue(req: Request, res: Response) {
    try {
      const segmentResponse = await this.segmentService.getSegmentByIssueId(req.params.issueId);

      if (segmentResponse.rows.length === 0) {
        return res.status(404).send({ 
          message: "No segment found" 
        });
      }

      const segment = segmentResponse.rows[0];

      if (!await this.isUserAssignedToProject(req, segment.project_id)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      await this.issueService.deleteSegmentIssueById(req.params.issueId);
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
  * PATCH /api/segment/error/:issueId
  * @note
  * @issue
  * @level
  */
  async patchSegmentIssue(req: Request, res: Response) {
    const {
      note, issue, level
    } = req.body;
    
    try {
      const segmentResponse = await this.segmentService.getSegmentByIssueId(req.params.issueId);

      if (segmentResponse.rows.length === 0) {
        return res.status(400).send({ message: "No segment found" });
      }

      const segment = segmentResponse.rows[0];

      if (!await this.isUserAssignedToProject(req, segment.project_id)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      const segmentIssueResponse =  await this.issueService.getSegmentIssueById(req.params.issueId);
      const segmentIssue = segmentIssueResponse.rows[0];
      const updatedSegmentIssue = {
        ...segmentIssue,
        ...(note !== undefined && { note }),
        ...(issue !== undefined && { issue }),
        ...(level !== undefined && { level })
      };

      await this.issueService.updateSegmentIssue(updatedSegmentIssue);

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

  async isUserAssignedToProject(req: Request, projectId: string) {
    if (req.role === "superadmin") {
      return true;
    }

    const userProjectsResponse = await this.projectService.getProjectsByUserId(String(req.userId));
    return userProjectsResponse.rows.filter((proj) => Number(proj.project_id) === Number(projectId)).length > 0;
  }

}

export default SegmentController;
