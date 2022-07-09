import express from "express";
import requireUser from "../middleware/requireUser";
import { createCommentHandler } from "../controller/comment.controller";

const router = express.Router();

router.post("/comment/:post_id", requireUser, createCommentHandler);

export default router;
