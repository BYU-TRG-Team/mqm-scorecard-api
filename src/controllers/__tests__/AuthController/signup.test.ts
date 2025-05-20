import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from "../../../bottle";
import { setTestEnvironmentVars } from "../helpers";

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
});
