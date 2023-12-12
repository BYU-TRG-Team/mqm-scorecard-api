import TokenHandler from "../../../support/tokenhandler.support";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import UserService from "../../../services/user.service";
import { setTestEnvironmentVars } from "../helpers";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests verifyRecovery method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });

  it("should throw a 400 error for non valid token", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
      },
      params: {
        token: "test",
      },
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.verifyRecovery(req, res);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["reset_password_token"],
      ["test"]
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Something went wrong on our end. Please try again." 
    });
  });

  it("should throw a 400 error for expired token", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
      },
      params: {
        token: "test",
      },
    });
    
    
    jest.spyOn(TokenHandler.prototype, "isPasswordTokenExpired");
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ reset_password_token_created_at: 0 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.verifyRecovery(req, res);

    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledTimes(1);
    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledWith({ 
      reset_password_token_created_at: 0 
    });

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["reset_password_token"],
      ["test"]
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Something went wrong on our end. Please try again." 
    });
  });

  it("should redirect to /recover/test", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
      },
      params: {
        token: "test",
      },
    });

    jest.spyOn(TokenHandler.prototype, "isPasswordTokenExpired");
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ reset_password_token_created_at: 3093496462800000 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.verifyRecovery(req, res);

    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledTimes(1);
    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledWith({ 
      reset_password_token_created_at: 3093496462800000 
    });

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["reset_password_token"],
      ["test"]
    );

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/recover/test");
  });
});
