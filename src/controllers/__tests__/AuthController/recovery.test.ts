import AuthController from "../../auth.controller";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from '../../../bottle';
import UserService from '../../../services/user.service';
import { setTestEnvironmentVars } from "../helpers";

jest.mock("pg");
jest.mock('nodemailer');

describe('tests recovery method', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    setTestEnvironmentVars();
  });
  
  it('should throw a 400 error for invalid body', async () => {
    const bottle = constructBottle();
    const req = getMockReq();
    const { res } = getMockRes();

    await bottle.container.AuthController.recovery(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: 'Body must include email' 
    });
  });

  it('should redirect to /recover/sent but not send a password reset email', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'test',
      },
    });
    
    jest.spyOn(AuthController.prototype, 'sendPasswordResetEmail');
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.recovery(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/recover/sent');

    expect(AuthController.prototype.sendPasswordResetEmail).toHaveBeenCalledTimes(0);
  });

  it('should redirect to /recover/sent and send a password reset email', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'test',
      },
      headers: {
        host: 'test',
      },
    });

    jest.spyOn(AuthController.prototype, 'sendPasswordResetEmail');
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ test: 'test' }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(UserService.prototype, "setAttributes").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.recovery(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/recover/sent');

    expect(AuthController.prototype.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(AuthController.prototype.sendPasswordResetEmail).toHaveBeenCalledWith(
      req,
      { test: 'test' }
    );
  });
});
