import Bottle from "bottlejs";
import { verifyToken, checkVerification, checkRole } from "../middleware/auth.middleware";
import { Express } from "express";

export default (app: Express, bottle: Bottle) => {
  app.post(
    "/api/issues",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(["superadmin"]),
    bottle.container.IssueController.updateTypology.bind(bottle.container.IssueController),
  );

  app.get(
    "/api/issues",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(["admin", "superadmin"]),
    bottle.container.IssueController.getTypology.bind(bottle.container.IssueController),
  );
};
