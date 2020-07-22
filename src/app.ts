import express from "express";
import compression from "compression"; // compresses requests
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets";
import { validateToken } from "./util/tokens";
import logger from "./util/logger";
// Controllers (route handlers)
import * as tokenController from "./controllers/tokens";

// Create Express server
const app = express();
// Connect to MongoDB
const dbUrl = MONGODB_URI;

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log("MongoDB Connected");
  });

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

// Express configuration
app.set("port", process.env.PORT || 3000);

app.use(compression());
app.use(validateToken);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/refresh", tokenController.refreshTokens);

export default app;
