import express from "express";
import {
  createNewOrderHandler,
  orderCompleteHandler,
} from "../controller/order.controller";

import requireUser from "../middleware/requireUser";

const router = express.Router();

router.post("/new/:product_id", createNewOrderHandler);

router.get("/verify/:trxn_id/:tx_ref", orderCompleteHandler);

export default router;
