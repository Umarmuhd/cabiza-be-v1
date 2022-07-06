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

// const whitelist = ['http://developer1.com', 'http://developer2.com']
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error())
//     }
//   }
// }

// var corsOptions = {
//   origin: function (origin, callback) {
//     console.log(`Origin ${origin} is being granted CORS access`);
//     callback(null, true)
//   }
// }

const corsOptions: cors.CorsOptions = { origin: "*" };

app.use(cors(corsOptions));
app.use(helmet());

app.use(router);

const port = config.get("port");

app.listen(port, () => {
  log.info(`App started at http://localhost:${port}`);
  connectToDb();
});
