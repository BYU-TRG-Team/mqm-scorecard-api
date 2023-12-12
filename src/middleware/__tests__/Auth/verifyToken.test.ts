import jwt from "jsonwebtoken";
import { verifyToken } from "../../auth.middleware";
import { setTestEnvironmentVars } from "../../../controllers/__tests__/helpers";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";

describe("tests verifyToken method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });

  it("should call next due to valid token", async () => {
    const bottle = constructBottle();
    const { res, next } = getMockRes();
    const authToken = jwt.sign({
      id: 1, 
      role: "superadmin", 
      verified: true, 
      username: "test", 
      rememberMe: false,
    }, bottle.container.CleanEnv.AUTH_SECRET, {
      expiresIn: 604800, //  1 week
    });
    const req = getMockReq({
      cookies: {
        scorecard_authtoken: authToken,
      },
    });

    verifyToken(bottle.container.CleanEnv)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(req.userId).toBe(1);

    expect(req.role).toBe("superadmin");
  });

  it("should fail with 401 due to absent jwt token", async () => {
    const bottle = constructBottle();
    const { res, next } = getMockRes();
    const req = getMockReq({
      cookies: {
        scorecard_authtoken: undefined,
      },
    });

    verifyToken(bottle.container.CleanEnv)(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      message: "Unauthorized Error",
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should fail with 403 due to invalid jwt token", async () => {
    const bottle = constructBottle();
    const { res, next } = getMockRes();
    const authToken = jwt.sign({
      id: 1, 
      role: "superadmin", 
      verified: true, 
      username: "test", 
      rememberMe: false,
    }, "INCORRECT SECRET", {
      expiresIn: 604800, //  1 week
    });
    const req = getMockReq({
      cookies: {
        scorecard_authtoken: authToken,
      },
    });

    verifyToken(bottle.container.CleanEnv)(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      message: "Access Forbidden",
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
