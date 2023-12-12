import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload"
import cookieParser from "cookie-parser";
import path from "path";
import constructAuthRoutes from "./routes/auth.routes";
import constructUserRoutes from "./routes/user.routes";
import constructProjectRoutes from "./routes/project.routes";
import constructSegmentRoutes from "./routes/segment.routes";
import constructIssueRoutes from "./routes/issue.routes";
import { constructBottle } from "./bottle";

const app = express();

app.use(express.static(path.join(__dirname, '../../build')));
app.use(bodyParser());
app.use(cookieParser());
app.use(express.urlencoded({
  extended: true,
}));
app.use(fileUpload({
  createParentPath: true,
}));

const bottle = constructBottle();

constructAuthRoutes(app, bottle);
constructUserRoutes(app, bottle);
constructProjectRoutes(app, bottle);
constructSegmentRoutes(app, bottle);
constructIssueRoutes(app, bottle);

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

let port: any;

if (process.env.APP_ENV === 'development') {
  port = 8081;
} else {
  port = process.env.PORT || 3000;
}

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
