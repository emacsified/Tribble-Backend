import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import { Sequelize } from "sequelize";
import { POSTGRES_URI } from "./util/secrets";
import { validateToken } from "./util/tokens";

// Controllers (route handlers)
import * as apiController from "./controllers/api";
import * as tokenController from "./controllers/tokens";

// Create Express server
const app = express();
app.use(validateToken);
// Connect to MongoDB
const dbUrl = POSTGRES_URI;

const sequelize = new Sequelize({
  dialect: "postgres",
  host: dbUrl,
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

/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/facebook", apiController.getFacebook);

// /**
//  * OAuth authentication routes. (Sign in)
//  */
// app.get("/auth/facebook");
// app.get("/auth/facebook/callback", (req, res) => {
//   res.redirect(req.session.returnTo || "/");
// });

export default app;
