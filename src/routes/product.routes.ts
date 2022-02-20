import express from "express";
import {
  createNewProductHandler,
  getAllProductsHandler,
  getSingleProductHandle,
  getUserProductsHandler,
} from "../controller/product.controller";

import requireUser from "../middleware/requireUser";

const router = express.Router();

router.post("/new", requireUser, createNewProductHandler);

router.get("/user/:user_id", getUserProductsHandler);

router.get("/all", getAllProductsHandler);

router.get("/product/:product_id", getSingleProductHandle);

export default router;
