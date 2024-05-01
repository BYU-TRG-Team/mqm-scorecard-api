import { Logger } from "winston";
import errorMessages from "../messages/errors.messages";
import ErrorService from "../services/error.service";
import ProjectService from "../services/project.service";
import SegmentService from "../services/segment.service";
import { Request, Response } from "express";
import { isError } from "../type-guards";

class SegmentController {
  constructor(
    private readonly segmentService: SegmentService, 
    private readonly projectService: ProjectService, 
    private readonly errorService: ErrorService,
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
  async createError(req: Request, res: Response) {
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

      await this.errorService.addError(
        req.params.segmentId, 
        note, 
        highlighting, 
        issue, 
        level, 
        type, 
        highlightStartIndex, 
        highlightEndIndex
      );
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
  * DELETE /api/segment/error/:errorId
  */
  async deleteError(req: Request, res: Response) {
    try {
      const segmentResponse = await this.segmentService.getSegmentByErrorId(req.params.errorId);

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

      await this.errorService.deleteErrorById(req.params.errorId);
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
  * PATCH /api/segment/error/:errorId
  * @note
  * @issue
  * @level
  */
  async patchError(req: Request, res: Response) {
    const {
      note, issue, level
    } = req.body;
    
    try {
      const segmentResponse = await this.segmentService.getSegmentByErrorId(req.params.errorId);

      if (segmentResponse.rows.length === 0) {
        return res.status(400).send({ message: "No segment found" });
      }

      const segment = segmentResponse.rows[0];

      if (!await this.isUserAssignedToProject(req, segment.project_id)) {
        return res.status(403).json({ 
          message: errorMessages.accessForbidden 
        });
      }

      const errorResponse =  await this.errorService.getErrorById(req.params.errorId);
      const error = errorResponse.rows[0];
      const updatedError = {
        ...error,
        ...(note !== undefined && { note }),
        ...(issue !== undefined && { issue }),
        ...(level !== undefined && { level })
      };

      await this.errorService.updateError(updatedError);

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
