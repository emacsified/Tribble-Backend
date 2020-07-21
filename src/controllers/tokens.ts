"use strict";

import { Response, Request } from "express";
import { verify } from "jsonwebtoken";
import { createJWT } from "../util/tokens";
import { SESSION_SECRET } from "../util/secrets";
import { RefreshToken } from "../types/tokens";

export const refreshTokens = (req: Request, res: Response) => {
  try {
    const token = verify(req.get("authorization"), SESSION_SECRET) as RefreshToken;
    if (token.tokenType === "refresh") {
      // this is a refresh token
      const newToken = createJWT({
        userId: token.userId,
        role: token.role,
        tokenType: "jwt",
      });
      res.status(200).json({ token: newToken });
    } else {
      throw "Not a refresh token!";
    }
  } catch (e) {
    res.sendStatus(401);
  }
};
