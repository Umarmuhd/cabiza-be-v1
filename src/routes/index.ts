import express from "express";
import user from "./user.routes";
import auth from "./auth.routes";
import post from "./post.routes";
import product from "./product.routes";

const router = express.Router();

router.get("/healthcheck", (_, res) => res.sendStatus(200));

router.use("/api/v1/user", user);
router.use("/api/v1/auth", auth);

router.use("/api/v1/posts", post);
router.use("/api/v1/products", product);

export default router;
