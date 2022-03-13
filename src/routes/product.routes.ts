import express from "express";
import {
  createNewProductHandler,
  getAllProductsHandler,
  getSingleProductHandle,
  getUserProductsHandler,
} from "../controller/product.controller";

import requireUser from "../middleware/requireUser";
import fileUpload from "../utils/file-upload";

const router = express.Router();

router.post(
  "/new",
  [
    requireUser,
    fileUpload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "cover", maxCount: 1 },
      { name: "file", maxCount: 1 },
    ]),
  ],
  createNewProductHandler
);

router.get("/user/:user_id", getUserProductsHandler);

router.get("/all", getAllProductsHandler);

router.get("/product/:product_id", getSingleProductHandle);

export default router;
