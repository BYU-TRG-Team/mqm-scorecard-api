import { getMockReq, getMockRes } from '@jest-mock/express';
import { setTestEnvironmentVars } from '../helpers';
import { constructBottle } from '../../../bottle';
import UserService from '../../../services/user.service';
import TokenHandler from '../../../support/tokenhandler.support';

jest.mock("pg");
jest.mock('nodemailer');

describe('tests updateUser method', () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it('should update the user profile once with username, email, name, and password', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: 'test',
        email: 'test@test.com',
        name: 'Test',
        password: 'test',
        roleId: '1',
        testAttr: 'test',
      },
      params: {
        id: "10",
      },
      role: 'user',
      userId: "10"
    });

    req.cookies.scorecard_authtoken = bottle.container.TokenHandler.generateUserAuthToken(
      {
        verified: true,
        user_id: "10",
        username: "foo",
        role_id: "1"
      },
      req
    ).token;

    jest.spyOn(UserService.prototype, "setAttributes");
    jest.spyOn(TokenHandler.prototype, "generateUpdatedUserAuthToken");

    await bottle.container.UserController.updateUser(req, res);

    expect(UserService.prototype.setAttributes).toHaveBeenCalledTimes(1);
    const firstCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[0];
    expect(firstCall[0]).toStrictEqual(['username', 'email', 'name', 'password']);
    firstCall[0].forEach((attr: any, index: any) => {
      if (attr !== 'password') {
        expect(firstCall[1][index]).toBe(req.body[attr]);
      }
    });
    expect(firstCall[2]).toBe("10");
  });

  it('should update the user profile once with username, email, name, and password, and then a second time with roleId', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        username: 'test',
        email: 'test@test.com',
        name: 'Test',
        password: 'test',
        roleId: '1',
        testAttr: 'test',
      },
      params: {
        id: "10",
      },
      role: 'superadmin',
      userId: "10"
    });

    req.cookies.scorecard_authtoken = bottle.container.TokenHandler.generateUserAuthToken(
      {
        verified: true,
        user_id: "10",
        username: "foo",
        role_id: "3"
      },
      req
    ).token;

    jest.spyOn(UserService.prototype, "setAttributes");

    await bottle.container.UserController.updateUser(req, res);

    expect(UserService.prototype.setAttributes).toHaveBeenCalledTimes(2);
    const firstCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[0];
    expect(firstCall[0]).toStrictEqual(['username', 'email', 'name', 'password']);
    firstCall[0].forEach((attr: any, index: any) => {
      if (attr !== 'password') {
        expect(firstCall[1][index]).toBe(req.body[attr]);
      }
    });
    expect(firstCall[2]).toBe("10");
    const secondCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[1];
    expect(secondCall[0]).toStrictEqual(['role_id']);
    secondCall[0].forEach((attr: any, index: any) => {
      if (attr === 'role_id') {
        expect(secondCall[1][index]).toBe(req.body.roleId);
        return;
      }

      expect(secondCall[1][index]).toBe(req.body[attr]);
    });
    expect(secondCall[2]).toBe("10");
  });

  it('should update the user profile once with roleId', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        roleId: '1',
      },
      params: {
        id: "10",
      },
      role: 'superadmin',
      userId: "11"
    });

    jest.spyOn(UserService.prototype, "setAttributes");

    await bottle.container.UserController.updateUser(req, res);

    expect(UserService.prototype.setAttributes).toHaveBeenCalledTimes(1);
    const firstCall = (UserService.prototype.setAttributes as jest.Mock).mock.calls[0];
    expect(firstCall[0]).toStrictEqual(['role_id']);
    firstCall[0].forEach((attr: any, index: any) => {
      if (attr === 'role_id') {
        expect(firstCall[1][index]).toBe(req.body.roleId);
        return;
      }

      expect(firstCall[1][index]).toBe(req.body[attr]);
    });
    expect(firstCall[2]).toBe("10");
  });
});
