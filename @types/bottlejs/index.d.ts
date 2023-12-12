import { Logger } from "winston"
import { CleanEnv } from "../../src/clean-env"
import FileParser from "../../src/support/fileparser.support"
import IssueParser from "../../src/support/issueparser.support"
import TokenHandler from "../../src/support/tokenhandler.support"
import DBClientPool from "../../src/db-client-pool"
import SMTPService from "../../src/services/smtp.service"
import TokenService from "../../src/services/token.service"
import IssueService from "../../src/services/issue.service"
import UserService from "../../src/services/user.service"
import ProjectService from "../../src/services/project.service"
import SegmentService from "../../src/services/segment.service"
import AuthController from "../../src/controllers/auth.controller"
import UserController from "../../src/controllers/user.controller"
import ProjectController from "../../src/controllers/project.controller"
import SegmentController from "../../src/controllers/segment.controller"
import IssueController from "../../src/controllers/issue.controller"

declare module "bottlejs" {
  interface IContainer {
    CleanEnv: CleanEnv,
    FileParser: FileParser,
    TokenHandler: TokenHandler,
    IssueParser: IssueParser,
    Logger: Logger,
    DBClientPool: DBClientPool,
    SMTPService: SMTPService,
    TokenService: TokenService,
    UserService: UserService,
    IssueService: IssueService,
    ProjectService: ProjectService,
    SegmentService: SegmentService,
    AuthController: AuthController,
    UserController: UserController,
    ProjectController: ProjectController,
    SegmentController: SegmentController,
    IssueController: IssueController
  }
}