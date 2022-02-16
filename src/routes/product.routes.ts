import express from "express";
// import {
//   createNewPostHandler,
//   deletePostsHandler,
//   getUserPostsHandler,
// } from "../controller/post.controller";
import requireUser from "../middleware/requireUser";

const router = express.Router();

// router.post("/new", requireUser, createNewPostHandler);

// router.get("/post/:user_id", getUserPostsHandler);

// router.get("/post/:post_id", requireUser, deletePostsHandler);

export default router;
