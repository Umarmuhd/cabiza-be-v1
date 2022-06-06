require("dotenv").config();
import express from "express";
import config from "config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import connectToDb from "./utils/connectToDb";
import log from "./utils/logger";
import router from "./routes";
import deserializeUser from "./middleware/deserializeUser";
import { CORS_ORIGIN } from "./constants";

const app = express();

app.use(express.json());

app.use(deserializeUser);

app.use(cors({ origin: CORS_ORIGIN }));

app.use(router);

const port = config.get("port");

app.listen(port, () => {
  log.info(`App started at http://localhost:${port}`);
  connectToDb();
});
