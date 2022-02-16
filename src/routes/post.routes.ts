import express from "express";
import {
  createNewPostHandler,
  deletePostsHandler,
  getSinglePostHandler,
  getUserPostsHandler,
  publishingHandler,
} from "../controller/post.controller";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router.get("/post/:post_id", getSinglePostHandler);

router.post("/new", requireUser, createNewPostHandler);

router.get("/user/:user_id", getUserPostsHandler);

router.delete("/post/:post_id", requireUser, deletePostsHandler);

router.put("/publishing/:post_id", requireUser, publishingHandler);

export default router;
