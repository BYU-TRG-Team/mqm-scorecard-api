import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import TokenService from "../../../services/token.service";
import UserService from "../../../services/user.service";
import { setTestEnvironmentVars } from "../helpers";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests verify method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });

  it("should redirect to /login for invalid verify token", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        token: "test",
      },
    });

    jest.spyOn(TokenService.prototype, "findTokens").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.verify(req, res);

    expect(TokenService.prototype.findTokens).toBeCalledTimes(1);
    expect(TokenService.prototype.findTokens).toHaveBeenCalledWith(
      ["token"],
      ["test"]
    );

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should throw a 500 error token with no associated user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
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
    jest.spyOn(TokenService.prototype, "findTokens").mockResolvedValueOnce({ 
      rows: [{ user_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.verify(req, res);

    expect(TokenService.prototype.findTokens).toBeCalledTimes(1);
    expect(TokenService.prototype.findTokens).toHaveBeenCalledWith(
      ["token"],
      ["test"]
    );

    expect(UserService.prototype.findUsers).toBeCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["user_id"],
      [1]
    );

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Something went wrong on our end. Please try again." 
    });
  });

  it("should set user as verified, remove token, and redirect to /login", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        token: "test",
      },
    });
    
    jest.spyOn(UserService.prototype, "setAttributes");
    jest.spyOn(TokenService.prototype, "deleteToken");
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ user_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(TokenService.prototype, "findTokens").mockResolvedValueOnce({ 
      rows: [{ user_id: 1, token: "test" }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    
    await bottle.container.AuthController.verify(req, res);

    expect(TokenService.prototype.findTokens).toBeCalledTimes(1);
    expect(TokenService.prototype.findTokens).toHaveBeenCalledWith(
      ["token"],
      ["test"]
    );

    expect(UserService.prototype.findUsers).toBeCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["user_id"],
      [1]
    );

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/login");

    expect(UserService.prototype.setAttributes).toBeCalledTimes(1);
    const setAttributesMockCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[0];
    expect(setAttributesMockCall[0]).toStrictEqual(["verified"]);
    expect(setAttributesMockCall[1][0]).toBe(true);
    expect(setAttributesMockCall[2]).toBe("1");

    expect(TokenService.prototype.deleteToken).toBeCalledTimes(1);
    expect(TokenService.prototype.deleteToken).toHaveBeenCalledWith("test");
  });
});
