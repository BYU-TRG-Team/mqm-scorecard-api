import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import errorMessages from '../messages/errors.messages';
import { Request, Response, NextFunction } from "express";
import { CleanEnv } from  "../clean-env";

export const verifyToken = (cleanEnv: CleanEnv) => (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.scorecard_authtoken;

  if (!token) {
    return res.status(401).send({
      message: errorMessages.requestUnauthorized,
    });
  }

  jwt.verify(token, cleanEnv.AUTH_SECRET, { ignoreExpiration: true }, (err, decoded: any) => {
    if (err) {
      return res.status(403).send({
        message: errorMessages.accessForbidden,
      });
    }
    
    req.userId = decoded.id;
    req.role = decoded.role;
    return next();
  });
};

export const checkVerification = (req: Request, res: Response, next: NextFunction) => {
  const token: any = jwtDecode(req.cookies.scorecard_authtoken);

  if (token && token.verified) {
    return next();
  }

  return res.status(403).send({
    message: errorMessages.accessForbidden,
  });
};

export const checkRole = (roles: any[]) => (req: Request, res: Response, next: NextFunction) => {
  const token: any = jwtDecode(req.cookies.scorecard_authtoken);

  if (token && roles.includes(token.role)) {
    return next();
  }

  return res.status(403).send({
    message: errorMessages.accessForbidden,
  });
};