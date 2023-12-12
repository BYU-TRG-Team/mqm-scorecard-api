import nodemailer from 'nodemailer';
import sendGridNodemailerTransport from 'nodemailer-sendgrid-transport';
import winston from 'winston';
import FileParser from './support/fileparser.support';
import TokenHandler from './support/tokenhandler.support';
import IssueParser from './support/issueparser.support';
import UserService from './services/user.service';
import IssueService from './services/issue.service';
import ProjectService from "./services/project.service";
import SegmentService from "./services/segment.service";
import TokenService from "./services/token.service"
import SMTPService from './services/smtp.service';
import AuthController from './controllers/auth.controller';
import UserController from "./controllers/user.controller";
import ProjectController from './controllers/project.controller';
import SegmentController from "./controllers/segment.controller";
import IssueController from './controllers/issue.controller';
import Bottle from "bottlejs";
import { Pool } from "pg";
import DBClientPool from "./db-client-pool";
import { constructCleanEnv } from "./clean-env";
import { AppEnv, EmailProvider } from './enums';

export const constructBottle = () => {
  const bottle = new Bottle();

  // Support
  bottle.factory("CleanEnv", () => constructCleanEnv())
  bottle.service("FileParser", FileParser)
  bottle.service("TokenHandler", TokenHandler, "CleanEnv");
  bottle.service("IssueParser", IssueParser);
  bottle.factory("Logger", () => {
    const {
      combine, errors, colorize, timestamp, prettyPrint,
    } = winston.format;

    return winston.createLogger({
      transports: [
        new winston.transports.Console(),
      ],
      format: combine(
        errors({ stack: true }),
        colorize(),
        timestamp(),
        prettyPrint(),
      ),
    });
  });

  // Services
  bottle.service("TokenService", TokenService, "DBClientPool");
  bottle.service("UserService", UserService, "DBClientPool");
  bottle.service("IssueService", IssueService, "DBClientPool");
  bottle.service("ProjectService", ProjectService, "DBClientPool");
  bottle.service("SegmentService", SegmentService, "DBClientPool");
  bottle.factory("DBClientPool", (container) => {
    const pool = new Pool({
      connectionString: container.CleanEnv.DATABASE_URL,
      ssl: container.CleanEnv.APP_ENV === AppEnv.Production ? { rejectUnauthorized: false } : false
    });

    return new DBClientPool(pool)
  })
  bottle.factory("SMTPService", (container) => {
    const transporter = nodemailer.createTransport(
      container.CleanEnv.EMAIL_PROVIDER === EmailProvider.Zoho ?
      {
        service: container.CleanEnv.EMAIL_PROVIDER,
        secure: true,
        auth: {
          user: container.CleanEnv.EMAIL_ADDRESS,
          pass: container.CleanEnv.EMAIL_PASSWORD,
        },
      }
      : sendGridNodemailerTransport({
        auth: {
          api_key: container.CleanEnv.EMAIL_PROVIDER_API_KEY
        },
      })
    );
      
    return new SMTPService(transporter);
  });

  // Controllers
  bottle.service(
    "AuthController", 
    AuthController, 
    "SMTPService",
    "UserService",
    "TokenService",
    "TokenHandler",
    "DBClientPool",
    "Logger",
    "CleanEnv"
  );
  bottle.service(
    "UserController",
    UserController,
    "UserService",
    "TokenHandler",
    "Logger"
  );
  bottle.service(
    "ProjectController",
    ProjectController,
    "DBClientPool",
    "UserService",
    "FileParser",
    "ProjectService",
    "IssueService",
    "SegmentService",
    "IssueParser",
    "Logger"
  );
  bottle.service(
    "SegmentController",
    SegmentController,
    "SegmentService",
    "ProjectService",
    "IssueService",
    "Logger"
  );
  bottle.service(
    "IssueController",
    IssueController,
    "IssueService",
    "ProjectService",
    "FileParser",
    "IssueParser",
    "DBClientPool",
    "Logger"
  );

  return bottle;
}
