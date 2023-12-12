import { getMockReq, getMockRes } from '@jest-mock/express'
import { setTestEnvironmentVars } from '../helpers';
import { constructBottle } from '../../../bottle';
import UserService from '../../../services/user.service';
import TokenHandler from '../../..//support/tokenhandler.support';
import jwtDecode from 'jwt-decode';
import bcrypt from 'bcrypt';

jest.mock("pg");
jest.mock('nodemailer');

describe('tests processRecovery method', () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });
  
  it('should throw a 400 error for invalid body', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      params: {
        token: 'test',
      },
    });

    await bottle.container.AuthController.processRecovery(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Body must include password' });
  });

  it('should throw a 400 error for invalid token', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        password: 'test',
      },
      params: {
        token: 'test',
      },
    });

    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [], 
      command: "", 
      rowCount: 0, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.processRecovery(req, res);

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ['reset_password_token'],
      ['test']
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: 'Something went wrong on our end. Please try again.' 
    });
  });

  it('should throw a 400 error for expired token', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        password: 'test',
      },
      params: {
        token: 'test',
      },
    });

    jest.spyOn(TokenHandler.prototype, 'isPasswordTokenExpired');
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{ reset_password_token_created_at: 0 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.processRecovery(req, res);

    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledTimes(1);
    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledWith({ 
      reset_password_token_created_at: 0 
    })

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ['reset_password_token'], 
      ['test']
    )

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ 
      message: 'Something went wrong on our end. Please try again.' 
    });
  });

  it('should successfully update password and return token and cookie', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        password: 'test',
      },
      params: {
        token: 'test',
      },
    });

    jest.spyOn(TokenHandler.prototype, 'isPasswordTokenExpired');
    jest.spyOn(UserService.prototype, 'setAttributes');
    jest.spyOn(UserService.prototype, "findUsers").mockResolvedValueOnce({ 
      rows: [{
        reset_password_token_created_at: 3093496462800000, user_id: 1, verified: true, role_id: 1, username: 'test',
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });

    await bottle.container.AuthController.processRecovery(req, res);

    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledTimes(1);
    expect(TokenHandler.prototype.isPasswordTokenExpired).toHaveBeenCalledWith({
      reset_password_token_created_at: 3093496462800000, user_id: 1, verified: true, role_id: 1, username: 'test',
    })

    expect(UserService.prototype.findUsers).toHaveBeenCalledTimes(1);
    expect(UserService.prototype.findUsers).toHaveBeenCalledWith(
      ['reset_password_token'],
      ['test']
    );

    expect(UserService.prototype.setAttributes).toHaveBeenCalledTimes(1);
    const mockSetAttributesCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[0];
    expect(mockSetAttributesCall[0]).toStrictEqual(['password', 'reset_password_token']);
    expect(bcrypt.compareSync(
      'test',
      mockSetAttributesCall[1][0],
    )).toBeTruthy();
    expect(mockSetAttributesCall[1][1]).toBe('');
    expect(mockSetAttributesCall[2]).toBe(1);

    expect(res.cookie).toBeCalledTimes(1);
    const mockCookieCall = (res.cookie as jest.Mock).mock.calls[0];
    expect(mockCookieCall[0]).toBe('scorecard_authtoken');
    expect(jwtDecode(mockCookieCall[1])).toMatchObject({
      id: 1,
      role: 'user',
      verified: true,
      username: 'test',
      rememberMe: false,
    });
    expect(mockCookieCall[2]).toMatchObject({
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
    });

    expect(res.send).toBeCalledTimes(1);
    const mockSendCall = (res.send as jest.Mock).mock.calls[0];
    expect(jwtDecode(mockSendCall[0].token)).toMatchObject({
      id: 1,
      role: 'user',
      verified: true,
      username: 'test',
      rememberMe: false,
    });
  });
});
