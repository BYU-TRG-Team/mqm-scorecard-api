import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import UserService from "../../../services/user.service";
import { setTestEnvironmentVars } from "../helpers";

jest.mock("pg");
jest.mock("nodemailer");

describe("tests verify method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });

  it("should return 400 error when userId is missing", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {},
      role: "superadmin" // User is a superadmin but didn't provide userId
    });

    await bottle.container.AuthController.verify(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Body must include userId" 
    });
  });

  it("should return 403 error when user is not a superadmin", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: { userId: 1 },
      role: "user" // Regular user, not superadmin
    });

    await bottle.container.AuthController.verify(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Unauthorized. Only superadmins can verify users." 
    });
  });

  it("should return 403 error when role is missing", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: { userId: 1 }
      // No role provided
    });

    await bottle.container.AuthController.verify(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Unauthorized. Only superadmins can verify users." 
    });
  });

  it("should return 404 error when user to verify is not found", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: { userId: 999 }, // Non-existent user ID
      role: "superadmin"
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.verify(req, res);

    expect(UserService.prototype.findUsers).toBeCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["user_id"],
      [999]
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "User not found" 
    });
  });

  it("should successfully verify a user", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: { userId: 1 },
      role: "superadmin"
    });
    
    jest.spyOn(UserService.prototype, "setAttributes").mockResolvedValueOnce({
      rows: [{ user_id: 1, verified: true }],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: []
    });
    
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ user_id: 1, verified: false }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    
    await bottle.container.AuthController.verify(req, res);

    expect(UserService.prototype.findUsers).toBeCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ["user_id"],
      [1]
    );

    expect(UserService.prototype.setAttributes).toBeCalledTimes(1);
    const setAttributesMockCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[0];
    expect(setAttributesMockCall[0]).toStrictEqual(["verified"]);
    expect(setAttributesMockCall[1][0]).toBe(true);
    expect(setAttributesMockCall[2]).toBe("1");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "User successfully verified" 
    });
  });

  it("should return 500 error when an exception occurs", async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: { userId: 1 },
      role: "superadmin"
    });

    jest.spyOn(UserService.prototype, "findUsers").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    await bottle.container.AuthController.verify(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ 
      message: "Something went wrong on our end. Please try again." 
    });
  });
});
