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

export async function createNewOrderHandler(req: Request, res: Response) {
  const { name, email, discount_code, price } = req.body;
  const product_id = req.params.product_id;

  try {
    const product = await ProductModel.findOne({ product_id });

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "product not found" });
    }

    const order = await createOrder({
      user: { full_name: name, email },
      discount_code,
      final_price: price,
      price,
      product: product._id,
    });

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "can't create order" });
    }

    const pay_link = await createPaymentLink(order);

    order.pay_link = pay_link.data.data.link;

    await order.save();

    return res.status(201).json({
      success: true,
      message: "product created successful",
      data: { order },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function orderCompleteHandler(req: Request, res: Response) {
  const { trxn_id, tx_ref } = req.params;

  try {
    const transaction = await getOrderPaymentStatus(trxn_id);

    if (transaction.error) {
      return res
        .status(400)
        .json({ status: "failed", message: "transaction does not exist" });
    }

    if (transaction.data.data.status !== "successful") {
      return res
        .status(400)
        .json({ status: "failed", message: "transaction not paid" });
    }

    const order_id = transaction.data.data.tx_ref;

    if (tx_ref !== order_id) {
      return res
        .status(400)
        .json({ status: "failed", message: "incorrect order id" });
    }

    const order = await OrderModel.findOne({ order_id })
      .populate("product")
      .exec();

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }

    if (order.order_paid) {
      return res.status(202).json({
        success: true,
        message: "order is already paid",
        data: { paid: true },
      });
    }

    const credit = await creditEarningsBalance({
      //@ts-ignore
      amount: order?.product.price,
      //@ts-ignore
      user: order?.product.user,
    });

    if (!credit.success) {
      return res
        .status(500)
        .json({ success: false, message: "an error occurred" });
    }

    order.order_paid = true;
    await order.save();

    await Mailer.send("order-confirm", order.user, {
      orderId: order.order_id,
      subject: "Welcome to Cabiza",
    });

    return res
      .status(200)
      .json({ success: true, message: "payment successfully made" });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ status: "failed", message: error.message });
  }
}
