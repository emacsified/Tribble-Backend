import * as jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { SESSION_SECRET } from "./secrets";
import { RequestToken, RefreshToken } from "../types/tokens";
export interface RequestWithUser extends Request {
  user: object;
}
export const validateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.cookies.jwt) {
    return res.sendStatus(401);
  }
  try {
    const userToken = jwt.verify(req.cookies.jwt, SESSION_SECRET) as RequestToken;
    req.user = userToken;
    return next();
  } catch (e) {
    return res.sendStatus(401);
  }
};

export const createJWT = (ObjectToSign: RequestToken) => {
  return jwt.sign(ObjectToSign, SESSION_SECRET, {
    expiresIn: "1h",
  });
};

export const createRefreshToken = (ObjectToSign: RefreshToken) => {
  return jwt.sign(ObjectToSign, SESSION_SECRET, {
    expiresIn: "30d",
  });
};
