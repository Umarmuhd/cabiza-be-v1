import { Request, Response } from "express";
import fs from "fs";
import ProductModel from "../model/product.model";
import { createProduct } from "../service/product.service";
import log from "../utils/logger";
import aws from "../utils/aws";
import braintree from "../utils/braintree";

export async function createNewProductHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    const product = await createProduct({ ...req.body, user: user_id });

    return res.status(201).json({
      success: true,
      message: "Product created successful",
      data: { product },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function updateProductHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const product_id = req.params.product_id;

  const { name, description, call_to_action, summary, url } = req.body;
  const { user_priced, min_percent, max_percent, price } = req.body;

  try {
    let product = await ProductModel.findOne({ product_id });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    if (product.user?.toString() !== user_id) {
      return res
        .status(403)
        .json({ success: false, message: "user unauthorized" });
    }

    // const user_priced = {};

    // product.name = name;
    // product.description = description;
    // product.call_to_action = call_to_action;
    // product.summary = summary;
    // product.url = url;
    // product.user_priced = { user_priced, min_percent, max_percent };
    // product.price = price;

    // await product.save();

    product = await ProductModel.findByIdAndUpdate(product_id, req.body, {
      new: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getUserProductsHandler(req: Request, res: Response) {
  const user_id = req.params.user_id;

  try {
    const products = await ProductModel.find({ user: user_id });

    return res
      .status(200)
      .json({ success: true, message: "product list", data: { products } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getAllProductsHandler(req: Request, res: Response) {
  try {
    const products = await ProductModel.find({ published: true })
      .populate("user", "full_name profile_picture category username")
      .exec();

    if (products) {
      return res
        .status(200)
        .json({ success: true, message: "products list", data: { products } });
    }
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getAllUserPublishedProduct(req: Request, res: Response) {}

export async function handleProductPublishing(req: Request, res: Response) {
  const user_id = res.locals.user._id;
  const product_id = req.params.product_id;

  try {
    const product = await ProductModel.findById(product_id);

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "product not found" });
    }

    if (product.user?.toString() !== user_id) {
      return res.status(403).json({
        success: false,
        message: "user unauthorized to perform action",
      });
    }

    product.published = !product.published;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `product ${product.published ? "published" : "unpublished"}`,
      data: { product },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getSingleProductHandle(req: Request, res: Response) {
  const product_id = req.params.product_id;
  try {
    const product = await ProductModel.findOne({ product_id })
      .populate("user", "full_name profile_picture category username")
      .exec();

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "product found", data: { product } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getTokenBrainTree(req: Request, res: Response) {
  try {
    //@ts-ignore
    braintree.clientToken.generate({}, function (err: any, response: any) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      return res
        .status(200)
        .json({ success: true, message: "token generated", data: response });
    });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function processBrainTreePayment(req: Request, res: Response) {
  try {
    let nonceFromTheClient = req.body.paymentMethodNonce;
    let amountFromTheClient = req.body.amount;

    // charge
    let newTransaction = braintree.transaction.sale(
      {
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true,
        },
      },
      //@ts-ignore
      (error: any, result: any) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.json(result);
        }
      }
    );
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
