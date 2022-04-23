import { Request, Response } from "express";
import OrderModel from "../model/orders.model";
import ProductModel from "../model/product.model";
import {
  createOrder,
  createPaymentLink,
  getOrderPaymentStatus,
} from "../service/order.service";
import { creditEarningsBalance } from "../service/wallet.service";
import log from "../utils/logger";
const Mailer = require("../utils/mailer");

export async function orderCompleteHandler(req: Request, res: Response) {
  const { trxn_id, tx_ref } = req.params;

  try {
    const transaction = await getOrderPaymentStatus(trxn_id);

    if (transaction.error) {
      return res
        .status(400)
        .json({ success: false, message: "transaction does not exist" });
    }

    if (transaction.data.data.status !== "successful") {
      return res
        .status(400)
        .json({ success: false, message: "transaction not paid" });
    }

    const order_id = transaction.data.data.tx_ref;

    if (tx_ref !== order_id) {
      return res
        .status(400)
        .json({ success: false, message: "incorrect order id" });
    }

    const order = await OrderModel.findOne({ order_id })
      .populate("product")
      .exec();

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }

    const credit = await creditEarningsBalance({
      //@ts-ignore
      amount: order?.product?.price,
      //@ts-ignore
      user: order?.product.user,
    });

    if (!credit.success) {
      return res
        .status(500)
        .json({ success: false, message: "an error occurred" });
    }

    await order.save();

    await Mailer.send("order-confirm", order.user, {
      orderId: order.order_id,
      subject: "Order Complete",
    });

    return res
      .status(200)
      .json({ success: true, message: "Payment successfully made" });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPaidOrderHandler(req: Request, res: Response) {
  const { user, amount, discount_code, payment_info } = req.body;

  const product_id = req.params.product_id;
  try {
    const product = await ProductModel.findOne({ product_id });

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "product not found" });
    }

    const existing_order = await OrderModel.findOne({
      payment_id: payment_info.payment_id,
    });

    if (existing_order) {
      return res
        .status(409)
        .json({ success: false, message: "Order already exists" });
    }

    const order = await createOrder({
      user,
      discount_code,
      final_price: amount,
      price: amount,
      product: product._id,
      payment_id: payment_info.payment_id,
      payment_method: payment_info.payment_method,
    });

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "can't create order" });
    }

    const credit = await creditEarningsBalance({ amount, user: product.user });

    if (!credit.success) {
      return res
        .status(500)
        .json({ success: false, message: "an error occurred" });
    }

    await Mailer.send("order-confirm", order.user, {
      orderId: order.order_id,
      subject: "Order Complete",
    });

    order.status = "complete";

    await order.save();

    return res
      .status(200)
      .json({ success: true, message: "Payment successfully made" });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}
