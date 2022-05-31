import { Request, Response } from "express";
import fs from "fs";
import ProductModel from "../model/product.model";
import { createProduct } from "../service/product.service";
import log from "../utils/logger";
import aws from "../utils/aws";
import braintree from "../utils/braintree";
import { findUserByUsername } from "../service/user.service";
import AffiliateModel from "../model/affiliates.models";

var cron = require('node-cron');

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

  const { user_priced, min_price, max_price } = req.body;

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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files["thumbnail"]) {
      const thumbnail = files["thumbnail"][0];

      const params = {
        Bucket: "cabizacore",
        ACL: "public-read",
        Key: `products/${product_id}/${thumbnail.filename}`,
        Body: fs.readFileSync(thumbnail.path),
      };

      const stored = await aws.upload(params).promise();
      req.body.thumbnail = stored.Location;
    }

    if (files["cover_image"]) {
      const cover_image = files["cover_image"][0];

      const params = {
        Bucket: "cabizacore",
        ACL: "public-read",
        Key: `products/${product_id}/${cover_image.filename}`,
        Body: fs.readFileSync(cover_image.path),
      };

      const stored = await aws.upload(params).promise();
      req.body.cover_image = stored.Location;
    }

    if (files["file"]) {
      const file = files["file"][0];

      const params = {
        Bucket: "cabizacore",
        ACL: "public-read",
        Key: `products/${product_id}/${file.filename}`,
        Body: fs.readFileSync(file.path),
      };

      const stored = await aws.upload(params).promise();
      req.body.file = stored.Location;
    }

    product = await ProductModel.findByIdAndUpdate(product._id, req.body, {
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

export async function scheduleUpdateProductHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const product_id = req.params.product_id;

  const { user_priced, min_price, max_price } = req.body;

  const date = req.body.date

  const dateInSeconds = date.getSeconds();
  const dateInMinutes = date.getMinutes();
  const dateInHours = date.getHours();
  const dateInDate = date.getDate()
  const dateInMonth = date.getMonth();
  const dateInDay = date.getDay();


  try {
    const job = await cron.schedule(`${dateInSeconds
      } ${dateInMinutes} ${dateInHours} ${dateInDate} ${dateInMonth} ${dateInDay}`, async () => {
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

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files["thumbnail"]) {
        const thumbnail = files["thumbnail"][0];

        const params = {
          Bucket: "cabizacore",
          ACL: "public-read",
          Key: `products/${product_id}/${thumbnail.filename}`,
          Body: fs.readFileSync(thumbnail.path),
        };

        const stored = await aws.upload(params).promise();
        req.body.thumbnail = stored.Location;
      }

      if (files["cover_image"]) {
        const cover_image = files["cover_image"][0];

        const params = {
          Bucket: "cabizacore",
          ACL: "public-read",
          Key: `products/${product_id}/${cover_image.filename}`,
          Body: fs.readFileSync(cover_image.path),
        };

        const stored = await aws.upload(params).promise();
        req.body.cover_image = stored.Location;
      }

      if (files["file"]) {
        const file = files["file"][0];

        const params = {
          Bucket: "cabizacore",
          ACL: "public-read",
          Key: `products/${product_id}/${file.filename}`,
          Body: fs.readFileSync(file.path),
        };

        const stored = await aws.upload(params).promise();
        req.body.file = stored.Location;
      }

      product = await ProductModel.findByIdAndUpdate(product._id, req.body, {
        new: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        data: { product },
      });
      });      
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }   
}

export async function getUserAffiliatesHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    const affiliate = await AffiliateModel.find({ user: user_id })
      .populate("product")
      .exec();

    res.status(200).json({
      success: true,
      message: "affiliate list",
      data: { affiliates: affiliate },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function becomeAffiliateHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const product_id = req.params.product_id;

  try {
    const product = await ProductModel.findOne({ product_id });
    if (!product) {
      res.status(400).json({ success: false, message: "product not found" });
      return;
    }

    const affiliate = await AffiliateModel.create({
      user: user_id,
      product: product._id,
      percentage: 0,
    });

    res.status(200).json({
      success: true,
      message: "Affiliate success!",
      data: { affiliate },
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

export async function getAllUserPublishedProduct(req: Request, res: Response) {
  const username = req.query.username as string;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      res.status(400).json({ success: false, message: "user not found" });
      return;
    }

    const products = await ProductModel.find({
      user: user._id,
      published: true,
    });

    res.status(200).json({ success: true, data: { products } });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

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
