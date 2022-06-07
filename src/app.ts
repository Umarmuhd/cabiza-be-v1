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
import { CORS_ORIGIN, CORS_ORIGIN_2 } from "./constants";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(deserializeUser);

app.use((req, res, next) => {
  console.log(req.headers);
  return next();
});

const whitelist = [CORS_ORIGIN, CORS_ORIGIN_2];
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    console.log(whitelist.indexOf(origin as string));

    callback(null, true);

    // if (whitelist.indexOf(origin as string) !== -1) {
    //   callback(null, true);
    // } else {
    //   callback(new Error("Not allowed by CORS"));
    // }
  },
};

app.use(cors(corsOptions));
app.use(helmet());

app.use(router);

const port = config.get("port");

app.listen(port, () => {
  log.info(`App started at http://localhost:${port}`);
  connectToDb();
});
