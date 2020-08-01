import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";

import { SESSION_SECRET } from "../util/secrets";

export type UserDocument = mongoose.Document & {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };

  comparePassword: comparePasswordFunction;
  createJWT: createJWTFunction;
  createRefresh: createJWTFunction;
  gravatar: (size: number) => string;
};

type comparePasswordFunction = (candidatePassword: string) => Promise<mongoose.Error | boolean>;
type createJWTFunction = () => string;

export interface AuthToken {
  accessToken: string;
  kind: string;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    tokens: Array,

    profile: {
      name: String,
      gender: String,
      location: String,
      website: String,
      picture: String,
    },
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err: mongoose.Error, hash: string) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function (this: UserDocument, candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(candidatePassword, this.password)
      .then((isMatch: boolean) => {
        resolve(isMatch);
      })
      .catch((e: mongoose.Error) => reject(e));
  });
};

const createJWT = function (this: UserDocument) {
  const ObjectToSign = {
    id: this._id,
    email: this.email,
    type: "jwt",
  };
  return jwt.sign(ObjectToSign, SESSION_SECRET, {
    expiresIn: "1h",
  });
};

const createRefresh = function (this: UserDocument) {
  const ObjectToSign = {
    id: this._id,
    email: this.email,
    type: "refresh",
  };

  return jwt.sign(ObjectToSign, SESSION_SECRET, {
    expiresIn: "30d",
  });
};

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.createJWT = createJWT;
userSchema.methods.createRefresh = createRefresh;

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size: number = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash("md5").update(this.email).digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

export const User = mongoose.model<UserDocument>("User", userSchema);
