import * as bodyParser from "body-parser";
import compression from "compression"; // compresses requests
import express from "express";
import mongoose from "mongoose";
import * as fs from "fs";

import * as authController from "./controllers/auth";
import * as tokenController from "./controllers/tokens";
import logger from "./util/logger";
import { MONGODB_URI, ENVIRONMENT } from "./util/secrets";
import { validateToken } from "./util/tokens";

// Create Express server
const app = express();

// Connect to MongoDB
const dbUrl = MONGODB_URI;

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log("MongoDB Connected");
  });

if (ENVIRONMENT !== "prod" && ENVIRONMENT !== "test") {
  mongoose.set("debug", function (
    coll: string,
    method: string,
    query: string,
    doc: string,
    options: string
  ) {
    const set = {
      coll,
      method,
      query,
      doc,
      options,
    };

    logger.info({
      dbQuery: set,
    });
  });
}
const modelPath = __dirname + "/models";
fs.readdirSync(modelPath).forEach(function (file) {
  require(modelPath + "/" + file);
});

// Express configuration
app.set("port", process.env.PORT || 3000);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/login", authController.login);
app.post("/register", authController.register);
app.get("/resetPassword/:id", authController.getResetPassword);
app.post("/resetPassword", authController.resetPassword);
app.post("/resetPassword/:id", authController.postResetPassword);

// authenticated routes
app.use(validateToken);

app.post("/api/refresh", tokenController.refreshTokens);

export default app;
