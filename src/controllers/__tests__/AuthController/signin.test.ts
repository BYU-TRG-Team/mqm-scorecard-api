import bcrypt from "bcrypt";
import jwtDecode from "jwt-decode";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import { setTestEnvironmentVars } from "../helpers";
import UserService from "../../../services/user.service";
import AuthController from "../../auth.controller";
import TokenService from "../../../services/token.service";
import DBClientPool from "../../../db-client-pool";
import TokenHandler from "../../../support/tokenhandler.support";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests signin method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });
  
  it("should throw a 400 error for invalid body", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
      },
      role: "user",
    });

    await bottle.container.AuthController.signin(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Body must include a username and password" 
    });
  });

  it("should throw a 400 error for no found user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        password: "test",
      },
      role: "user",
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.signin(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["username"],
      [req.body.username]
    );

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Username or password is incorrect. Please try again." 
    });
  });

  it("should throw a 400 error for invalid password", async () => {
    const bottle = constructBottle();
    const hashedPassword = await bcrypt.hash("foo", 10);
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        password: "test",
      },
      role: "user",
    });
    
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ password: hashedPassword }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.signin(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["username"],
      [req.body.username]
    );

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ message: "Username or password is incorrect. Please try again." });
  });

  it("should send a verification email to user if not signed in", async () => {
    const hashedPassword = await bcrypt.hash("test", 10);
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        password: "test",
      },
      role: "user",
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{
        password: hashedPassword, 
        user_id: 1, 
        role_id: 1, 
        verified: false, 
        username: "test",
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
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
    jest.spyOn(TokenService.prototype, "findTokens").mockResolvedValueOnce({ 
      rows: ["foobar"], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.signin(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);

    expect(AuthController.prototype.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(DBClientPool.prototype.beginTransaction).toHaveBeenCalledTimes(1);
    
    expect(DBClientPool.prototype.commitTransaction).toHaveBeenCalledTimes(1);

    expect(TokenService.prototype.create).toHaveBeenCalledTimes(1);
    const createTokenCall = (TokenService.prototype.create as jest.Mock).mock.calls[0];
    expect(createTokenCall[0]).toStrictEqual(1);
    expect(createTokenCall[1]).not.toBeUndefined();
    expect(createTokenCall[2]).not.toBeUndefined();
  });

  it("should successfully create a jwt token with rememberMe as false", async () => {
    const hashedPassword = await bcrypt.hash("test", 10);
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        password: "test",
      },
      role: "user",
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{
        password: hashedPassword, 
        user_id: 1, 
        role_id: 1, 
        verified: true, 
        username: "test",
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.signin(req, res);

    expect(res.cookie).toHaveBeenCalledTimes(1);
    const [mockResCookieCall] = (res.cookie as jest.Mock).mock.calls;
    expect(mockResCookieCall[0]).toBe("scorecard_authtoken");
    expect(jwtDecode(mockResCookieCall[1])).toMatchObject({
      id: 1,
      role: "user",
      verified: true,
      username: "test",
      rememberMe: false,
    });
    expect(mockResCookieCall[2]).toMatchObject({
      httpOnly: false,
      secure: false,
      sameSite: "strict",
    });

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      token: mockResCookieCall[1] 
    });
  });

  it("should successfully create a jwt token with rememberMe as true", async () => {
    const hashedPassword = await bcrypt.hash("test", 10);
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: "test",
        password: "test",
        rememberMe: true,
      },
      role: "user",
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{
        password: hashedPassword, 
        user_id: 1, 
        role_id: 1, 
        verified: true, 
        username: "test",
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.signin(req, res);

    expect(res.cookie).toHaveBeenCalledTimes(1);
    const [mockResCookieCall] = (res.cookie as jest.Mock).mock.calls;
    expect(mockResCookieCall[0]).toBe("scorecard_authtoken");
    expect(jwtDecode(mockResCookieCall[1])).toMatchObject({
      id: 1,
      role: "user",
      verified: true,
      username: "test",
      rememberMe: true,
    });
    expect(mockResCookieCall[2]).toMatchObject({
      httpOnly: false,
      secure: false,
      sameSite: "strict",
    });

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ 
      token: mockResCookieCall[1] 
    });
  });
});
