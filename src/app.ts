import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import { Sequelize } from "sequelize";
import { POSTGRES_URI } from "./util/secrets";
import { validateToken } from "./util/tokens";
import logger from "./util/logger";
// Controllers (route handlers)
import * as tokenController from "./controllers/tokens";

// Create Express server
const app = express();
app.use(validateToken);
// Connect to MongoDB
const dbUrl = POSTGRES_URI;

const sequelize = new Sequelize({
  dialect: "postgres",
  database: "loyalty",
  username: "",
  password: "",
  host: "localhost",
  port: 5432,
  // host: dbUrl,
  logging: (msg) => logger.info(msg),
});

try {
  sequelize.authenticate().then(() => {
    console.log("Connection has been established successfully.");
  });
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/refresh", tokenController.refreshTokens);

export default app;
