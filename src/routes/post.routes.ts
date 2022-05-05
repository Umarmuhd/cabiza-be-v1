import express from "express";
import {
  createCommentHandler,
  createNewPostHandler,
  deletePostsHandler,
  getAllUserPublishedPosts,
  getPostCommentsHandler,
  getSinglePostHandler,
  getUserPostsHandler,
  publishingHandler,
  updatePostHandler,
} from "../controller/post.controller";
import requireUser from "../middleware/requireUser";
import fileUpload from "../utils/file-upload";

const router = express.Router();

router.get("/post/:post_id", getSinglePostHandler);

router.post(
  "/new",
  [requireUser, fileUpload.single("attachment")],
  createNewPostHandler
);

router.post("/create/comment/:post_id", requireUser, createCommentHandler);

router.get("/comments/:post_id", getPostCommentsHandler);

router.patch(
  "/post/:post_id",
  [requireUser, fileUpload.single("attachment")],
  updatePostHandler
);

router.get("/user/:user_id", getUserPostsHandler);

router.get("/user", getAllUserPublishedPosts);

router.delete("/post/:post_id", requireUser, deletePostsHandler);

router.put("/publishing/:post_id", requireUser, publishingHandler);

export default router;
