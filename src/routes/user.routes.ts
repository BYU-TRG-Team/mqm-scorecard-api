import Bottle from "bottlejs";
import { verifyToken, checkVerification, checkRole } from "../middleware/auth.middleware";
import { Express } from "express";

export default (app: Express, bottle: Bottle) => {
  app.get(
    "/api/user/:id",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.UserController.getUser.bind(bottle.container.UserController),
  );

  app.get(
    "/api/users",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(["superadmin"]),
    bottle.container.UserController.getUsers.bind(bottle.container.UserController),
  );

  app.patch(
    "/api/user/:id",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    bottle.container.UserController.updateUser.bind(bottle.container.UserController),
  );

  app.delete(
    "/api/user/:id",
    verifyToken(bottle.container.CleanEnv),
    checkVerification,
    checkRole(["superadmin"]),
    bottle.container.UserController.deleteUser.bind(bottle.container.UserController),
  );
};
