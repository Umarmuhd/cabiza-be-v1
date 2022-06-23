<<<<<<< HEAD
require('dotenv').config();
import express from 'express';
import config from 'config';
import cors from 'cors';
import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes';
import deserializeUser from './middleware/deserializeUser';
import { CORS_ORIGIN } from './constants';
=======
require("dotenv").config();
import express, { Request } from "express";
import config from "config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import connectToDb from "./utils/connectToDb";
import log from "./utils/logger";
import router from "./routes";
import deserializeUser from "./middleware/deserializeUser";
import { CORS_ORIGIN, CORS_ORIGIN_2 } from "./constants";
>>>>>>> 7e5db27269ca19761008f88261182ffbc85ee5e2

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(deserializeUser);

<<<<<<< HEAD
app.use(cors({ origin: CORS_ORIGIN }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});
=======
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

const corsOptions: cors.CorsOptions = {
  origin: [CORS_ORIGIN, CORS_ORIGIN_2],
};

app.use(cors(corsOptions));
app.use(helmet());
>>>>>>> 7e5db27269ca19761008f88261182ffbc85ee5e2

app.use(router);

const port = config.get("port");

app.listen(port, () => {
  log.info(`App started at http://localhost:${port}`);
  connectToDb();
});
