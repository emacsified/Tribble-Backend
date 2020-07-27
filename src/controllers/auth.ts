"use strict";

import { Response, Request } from "express";
// import mongoose from "mongoose";
import { UserDocument, User } from "../models/User";
import logger from "../util/logger";
import * as crypto from "crypto";

// const User = mongoose.model("User");

interface LoginBody {
  email: string;
  password: string;
}

export const login = (req: Request, res: Response) => {
  const body = req.body as LoginBody;
  if (!body.email || !body.password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  User.findOne({ email: body.email }).then(async (doc) => {
    const result = doc as UserDocument;
    if (!result) {
      return res.status(401).json({ error: "Email or Password Incorrect" });
    }
    const passMatch = await result.comparePassword(body.password);
    if (passMatch) {
      // password matches
      return res.status(200).json({
        token: result.createJWT(),
        refresh: result.createRefresh(),
      });
    } else {
      return res.status(401).json({ error: "Email or Password Incorrect" });
    }
  });
};

interface RegisterBody {
  email: string;
  password: string;
  confirmPassword: string;
}

export const register = (req: Request, res: Response) => {
  const body = req.body as RegisterBody;
  if (!body.email || !body.password || !body.confirmPassword) {
    return res.status(400).json({ error: "Missing credentials" });
  }
  if (!/\S+@\S+\.\S+/.test(body.email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (body.password !== body.confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  // signup okay, proceed
  User.findOne({ email: body.email }).then((docs) => {
    if (!docs) {
      const newUser = new User({
        email: body.email,
        password: body.password,
      }) as UserDocument;
      newUser
        .save()
        .then(() => {
          res.sendStatus(200);
        })
        .catch((e) => {
          logger.error(e);
        });
    } else {
      res.status(400).json({ error: "User already exists" });
    }
  });
};

interface ResetPasswordBody {
  email: string;
}

export const resetPassword = async (req: Request, res: Response) => {
  const body = req.body as ResetPasswordBody;
  if (!body.email) {
    return res.status(400).json({ error: "Missing credentials" });
  }
  User.findOne({ email: body.email }).then((doc) => {
    const user = doc as UserDocument;
    if (user) {
      const randomToken = crypto.randomBytes(16);
      user.passwordResetToken = randomToken.toString();
      user.passwordResetExpires = new Date(Date.now() + 3600000);
      user
        .save()
        .then(() => {
          return res.sendStatus(200);
        })
        .catch((e) => {
          logger.error(e);
          return res.sendStatus(500);
        });
    } else {
      return res.sendStatus(200);
    }
  });
};

export const getResetPassword = (req: Request, res: Response) => {
  User.findOne({ passwordResetToken: req.params.id })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec((user) => {
      if (!user) {
        return res.sendStatus(404);
      } else {
        return res.sendStatus(200);
      }
    })
    .catch((e) => {
      logger.error(e);
    });
};

export const postResetPassword = (req: Request, res: Response) => {
  if (
    req.body.password !== req.body.confirmPassword ||
    !req.body.password ||
    !req.body.confirmPassword
  ) {
    return res.status(400).json({ error: "Invalid password" });
  }

  User.findOne({ passwordResetToken: req.params.id })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec((user: UserDocument) => {
      if (!user) {
        return res.sendStatus(404);
      } else {
        user.password = req.body.password;
        user
          .save()
          .then(() => {
            return res.sendStatus(200);
          })
          .catch((e) => {
            logger.error(e);
            return res.sendStatus(500);
          });
      }
    });
};
