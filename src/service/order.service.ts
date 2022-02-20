import config from "config";
import OrderModel, { Order } from "../model/orders.model";
const axios = require("axios").default;

export async function createOrder(input: Partial<Order>) {
  return OrderModel.create(input);
}

export async function createPaymentLink(order: any) {
  const baseUrl = config.get<string>("flutterwave.baseUrl");
  const sec_key = config.get<string>("flutterwave.secKey");
  try {
    const config = {
      method: "post",
      url: `${baseUrl}/payments`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sec_key}`,
      },
      data: JSON.stringify({
        tx_ref: order.order_id,
        amount: order.final_price,
        currency: "NGN",
        redirect_url: "https://cabiza-fe-v1.vercel.app/checkout/verifying",
        payment_options: "card",
        meta: {},
        customer: {
          email: order.user.email,
          phonenumber: "",
          name: order.user.full_name,
        },
        customizations: {
          title: "Cabiza",
          description:
            "Earn a living while you learn within an international community of experts and peers.",
          logo: "https://via.placeholder.com/300/09f/fff.png",
        },
      }),
    };

    const response = await axios(config);

    console.log(response.data);

    return { error: null, data: response.data };
  } catch (error: any) {
    console.log(error);
    return { error, data: null };
  }
}

export async function getOrderPaymentStatus(trxn_id: string) {
  const baseUrl = config.get<string>("flutterwave.baseUrl");
  const sec_key = config.get<string>("flutterwave.secKey");

  try {
    const config = {
      method: "get",
      url: `${baseUrl}/transactions/${trxn_id}/verify`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sec_key}`,
      },
    };

    const response = await axios(config);

    return { error: null, data: response.data };
  } catch (error: any) {
    console.log(error);
    return { error: error.response.data, data: null };
  }
}
