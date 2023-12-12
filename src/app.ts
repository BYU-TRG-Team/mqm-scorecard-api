import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import constructAuthRoutes from "./routes/auth.routes";
import constructUserRoutes from "./routes/user.routes";
import constructProjectRoutes from "./routes/project.routes";
import constructSegmentRoutes from "./routes/segment.routes";
import constructIssueRoutes from "./routes/issue.routes";
import { constructBottle } from "./bottle";

export const constructApp = () => {
  const app = express();
  const bottle = constructBottle();

  app.use(bodyParser());
  app.use(cookieParser());
  app.use(express.urlencoded({
    extended: true,
  }));
  app.use(fileUpload({
    createParentPath: true,
  }));

  constructAuthRoutes(app, bottle);
  constructUserRoutes(app, bottle);
  constructProjectRoutes(app, bottle);
  constructSegmentRoutes(app, bottle);
  constructIssueRoutes(app, bottle);

  return app;
};