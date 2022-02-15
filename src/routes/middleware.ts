import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../config";

export function authenticate(req, res, next) {
  const authHeader: string = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, tokenData) => {
      if (err) {
        return res.sendStatus(403);
      }
      const authInfo: AuthInfo = {
        ...tokenData,
        token,
      };
      req.authInfo = authInfo;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

export function softAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, tokenData) => {
      if (!err) {
        const authInfo: AuthInfo = {
          ...tokenData,
          token,
        };
        req.authInfo = authInfo;
      }
      return next();
    });
  } else {
    return next();
  }
}

export interface AuthInfo {
  token: string;
  phoneNumber: string;
}

export function getAuthInfoFromRequest(req: Request): AuthInfo | null {
  const request: any = req;
  const authInfo: AuthInfo | null = request.authInfo;
  return authInfo;
}
