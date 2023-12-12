import jwt from "jsonwebtoken";
import { checkRole } from "../../auth.middleware";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import { setTestEnvironmentVars } from "../../../controllers/__tests__/helpers";

describe("tests checkRole method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });

  it("should call next due to token including specified role", async () => {
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

    checkRole(["user", "superadmin"])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledTimes(0);

    expect(res.send).toHaveBeenCalledTimes(0);
  });

  it("should fail with a 403 for token not including specified role", async () => {
    const bottle = constructBottle();
    const { res, next } = getMockRes();
    const authToken = jwt.sign({
      id: 1, 
      role: "admin", 
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

    checkRole(["user", "superadmin"])(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      message: "Access Forbidden",
    });
  });
});
