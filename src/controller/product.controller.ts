import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { createProduct } from "../service/product.service";
import log from "../utils/logger";

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
    const products = await ProductModel.find({})
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
