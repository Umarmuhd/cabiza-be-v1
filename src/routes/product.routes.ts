import express from "express";
import {
  createNewProductHandler,
  getAllProductsHandler,
  getSingleProductHandle,
  getTokenBrainTree,
  getUserProductsHandler,
  handleProductPublishing,
  processBrainTreePayment,
  updateProductHandler,
} from "../controller/product.controller";

import requireUser from "../middleware/requireUser";
import fileUpload from "../utils/file-upload";

const router = express.Router();

router.post("/new", requireUser, createNewProductHandler);

router.get("/user/:user_id", getUserProductsHandler);

router.get("/all", getAllProductsHandler);

router.get("/product/:product_id", getSingleProductHandle);

router.post(
  "/product/:product_id",
  [
    requireUser,
    fileUpload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "cover_image", maxCount: 1 },
      { name: "file", maxCount: 1 },
    ]),
  ],
  updateProductHandler
);

router.get("/braintree/gettoken/:user_id", getTokenBrainTree);

router.post("/braintree/payment/:user_id", processBrainTreePayment);

router.put("/publishing/:product_id", requireUser, handleProductPublishing);

export default router;
