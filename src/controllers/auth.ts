"use strict";

import { Response, Request } from "express";
import * as mongoose from "mongoose";
import { UserDocument } from "../models/User";
import { createJWT } from "../util/tokens";

const User = mongoose.model("User");

interface LoginBody {
  email: string;
  password: string;
}
export const login = (req: Request, res: Response) => {
  const body = req.body as LoginBody;
  if (!body.email || !body.password) {
    return res.send(400).json({ error: "Missing credentials" });
  }

  User.findOne({ email: body.email }).then((doc) => {
    const result = doc as UserDocument;
    if (!doc) {
      return res.status(401).json({ error: "Email Or Password Incorrect" });
    }

    result.comparePassword(body.password).then((comparison) => {
      if (comparison) {
        // password matches
        // res.status(200).json({token:  })
      } else {
        return res.status(401).json({ error: "Email or Password Incorrect" });
      }
    });
  });
};
