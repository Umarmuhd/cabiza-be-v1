import express from "express";
import user from "./user.routes";
import auth from "./auth.routes";
import post from "./post.routes";
import product from "./product.routes";
import order from "./orders.routes";

const router = express.Router();

router.get("/healthcheck", (_, res) => res.sendStatus(200));

router.use("/api/v1/user", user);
router.use("/api/v1/auth", auth);

router.use("/api/v1/posts", post);
router.use("/api/v1/products", product);

router.use("/api/v1/orders", order);

export default router;
