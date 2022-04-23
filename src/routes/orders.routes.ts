import express from "express";
import {
  createPaidOrderHandler,
  orderCompleteHandler,
} from "../controller/order.controller";

import requireUser from "../middleware/requireUser";

const router = express.Router();

router.post("/create/:product_id", createPaidOrderHandler);

router.get("/verify/:trxn_id/:tx_ref", orderCompleteHandler);

export default router;
