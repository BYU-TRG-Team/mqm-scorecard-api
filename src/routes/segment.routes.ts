import Bottle from "bottlejs";
import { verifyToken, checkVerification } from "../middleware/auth.middleware";
import { Express } from "express";

export default (app: Express, bottle: Bottle) => {
  app.post(
    "/api/segment/:segmentId/error",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.SegmentController.createError.bind(bottle.container.SegmentController),
  );

  app.delete(
    "/api/segment/error/:errorId",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.SegmentController.deleteError.bind(bottle.container.SegmentController),
  );

  app.patch(
    "/api/segment/error/:errorId",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.SegmentController.patchError.bind(bottle.container.SegmentController),
  );
};
