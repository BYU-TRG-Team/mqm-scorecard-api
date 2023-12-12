import bcrypt from "bcrypt";
import AuthController from "../../auth.controller";
import { getMockReq, getMockRes } from "@jest-mock/express";
import UserService from "../../../services/user.service";
import { constructBottle } from "../../../bottle";
import TokenService from "../../../services/token.service";
import DBClientPool from "../../../db-client-pool";
import { setTestEnvironmentVars } from "../helpers";
import TokenHandler from "../../../support/tokenhandler.support";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests signup method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });
  
  it("should throw a 400 error", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        email: "test",
        password: "test",
      },
      role: "user",
    });

    await bottle.container.AuthController.signup(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should create a new user and send a verification email", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        email: "test",
        password: "test",
        name: "test",
      },
      headers: {
        host: "test",
      },
    });
    
    jest.spyOn(DBClientPool.prototype, "beginTransaction");
    jest.spyOn(DBClientPool.prototype, "commitTransaction");
    jest.spyOn(AuthController.prototype, "sendVerificationEmail");
    jest.spyOn(TokenHandler.prototype, "generateEmailVerificationToken").mockReturnValueOnce("foobar");
    jest.spyOn(TokenService.prototype, "create").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(UserService.prototype, "create").mockResolvedValueOnce({ 
      rows: [{ user_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.signup(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);

    expect(res.send).toHaveBeenCalledTimes(1);

    expect(AuthController.prototype.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(AuthController.prototype.sendVerificationEmail).toHaveBeenCalledWith(
      req,
      { user_id: 1 },
      "foobar"
    );

    expect(UserService.prototype.create).toHaveBeenCalledTimes(1);
    const createUserCall = (UserService.prototype.create as jest.Mock).mock.calls[0];
    expect(createUserCall[0]).toBe(req.body.username);
    expect(createUserCall[1]).toBe(req.body.email);
    expect(createUserCall[3]).toBe(1);
    expect(createUserCall[4]).toBe(req.body.name);
    expect(createUserCall[5]).not.toBeUndefined();
    const passwordIsValid = bcrypt.compareSync(
      "test",
      createUserCall[2],
    );
    expect(passwordIsValid).toBeTruthy();

    expect(DBClientPool.prototype.beginTransaction).toHaveBeenCalledTimes(1);
    
    expect(DBClientPool.prototype.commitTransaction).toHaveBeenCalledTimes(1);

    expect(TokenService.prototype.create).toHaveBeenCalledTimes(1);
    const createTokenCall = (TokenService.prototype.create as jest.Mock).mock.calls[0];
    expect(createTokenCall[0]).toStrictEqual(1);
    expect(createTokenCall[1]).not.toBeUndefined();
    expect(createTokenCall[2]).not.toBeUndefined();
  });
});
