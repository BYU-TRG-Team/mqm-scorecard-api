import jwt from "jsonwebtoken";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { checkVerification } from "../../auth.middleware";
import { constructBottle } from "../../../bottle";
import { setTestEnvironmentVars } from "../../../controllers/__tests__/helpers";

describe("tests checkVerification method", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });

  it("should call next due to verified token", async () => {
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

    checkVerification(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should fail with 403 due to invalid or unverified token", async () => {
    const bottle = constructBottle();
    const { res, next } = getMockRes();
    const authToken = jwt.sign({
      id: 1, 
      role: "superadmin", 
      verified: false, 
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

    checkVerification(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      message: "Access Forbidden",
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
