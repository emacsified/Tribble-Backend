import * as express from "express";
import * as compression from "compression"; // compresses requests
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets";
import { validateToken } from "./util/tokens";
import logger from "./util/logger";
// Controllers (route handlers)
import * as tokenController from "./controllers/tokens";

// Create Express server
const app = express();
app.use(validateToken);
// Connect to MongoDB
const dbUrl = MONGODB_URI;

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set("debug", function (coll, method, query, doc, options) {
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/refresh", tokenController.refreshTokens);

export default app;
