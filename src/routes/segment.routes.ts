import Bottle from "bottlejs";
import { verifyToken, checkVerification } from "../middleware/auth.middleware";
import { Express } from "express";

export default (app: Express, bottle: Bottle) => {
  app.post(
    "/api/segment/:segmentId/error",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.SegmentController.createSegmentIssue.bind(bottle.container.SegmentController),
  );

  app.delete(
    "/api/segment/error/:issueId",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.SegmentController.deleteSegmentIssue.bind(bottle.container.SegmentController),
  );

  app.patch(
    "/api/segment/error/:issueId",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.SegmentController.patchSegmentIssue.bind(bottle.container.SegmentController),
  );
};
