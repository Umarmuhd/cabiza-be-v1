import { Request, Response } from "express";
import fs from "fs";
import ProductModel from "../model/product.model";
import { createProduct } from "../service/product.service";
import log from "../utils/logger";
import aws from "../utils/aws";
// import braintree from "../utils/braintree";

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

export async function updateProductBasics(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const product_id = req.params.product_id;

  const { name, description } = req.body;

  try {
    const product = await ProductModel.findOne({ product_id });
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

    product.name = name;
    product.description = description;

    //@ts-ignore
    if (Object.keys(req?.files).length > 0) {
      //@ts-ignore
      const { thumbnail, cover_image } = req.files;
      const files = [thumbnail[0], cover_image[0]];

      aws.createBucket(() => {
        let Bucket_Path = "cabizacore";
        let ResponseData: any = [];

        files.map((item) => {
          let params = {
            Bucket: Bucket_Path,
            Key: `product/${product.product_id}/${item.filename}`,
            Body: fs.readFileSync(item.path),
            ACL: "public-read",
          };

          //@ts-ignore
          aws.upload(params, async function (err: any, data: any) {
            if (err) {
              return res
                .status(400)
                .json({ status: "failed", message: "can't upload document" });
            } else {
              ResponseData.push(data);

              fs.unlink(item.path, (err) => {
                console.log(err);
              });

              if (ResponseData.length == files.length) {
                const uploads: string[] = [];

                ResponseData.forEach((doc: any) => uploads.push(doc.Location));

                product.thumbnail = uploads[0];
                product.cover_image = uploads[1];

                await product.save();

                return res.status(201).json({
                  success: true,
                  message: "product updated successfully",
                  data: { product },
                });
              }
            }
          });
        });
      });
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "product updated successfully",
      data: { product },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function updateProductInfoHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;
  const product_id = req.params.product_id;

  const { call_to_action, summary } = req.body;

  try {
    const product = await ProductModel.findOne({ product_id });
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

    product.call_to_action = call_to_action;
    product.summary = summary;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "product info updated",
      data: { product },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function updateProductContentHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;
  const product_id = req.params.product_id;

  try {
    const url = req.body.url;
    const product_file = req.file;

    const product = await ProductModel.findOne({ product_id });
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

    if (req.file) {
      aws
        .upload(
          {
            Bucket: "cabizacore",
            ACL: "public-read",
            Key: `product/${product.product_id}/${product_file?.filename}`,
            //@ts-ignore
            Body: fs.readFileSync(product_file?.path),
          },
          {
            partSize: 10 * 1024 * 1024,
            queueSize: 10,
          }
        )
        .send(async (error, data) => {
          if (error) {
            return res
              .status(400)
              .json({ success: false, message: error.message });
          }

          product.url = url;
          product.file = data.Location;
          await product.save();

          return res.status(200).json({
            success: true,
            message: "product info updated",
            data: { product },
          });
        });
    }

    product.url = url;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "product info updated",
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

export async function getTokenBrainTree(req: Request, res: Response) {
  // try {
  //   braintree.clientToken.generate({}, function (err, response) {
  //     if (err) {
  //       return res.status(500).json({ success: false, message: err.message });
  //     }
  //     return res
  //       .status(200)
  //       .json({ success: true, message: "token generated", data: response });
  //   });
  // } catch (error: any) {
  //   log.error(error);
  //   return res.status(500).json({ success: false, message: error.message });
  // }
}

export async function processBrainTreePayment(req: Request, res: Response) {
  try {
    console.log(req.body);
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
