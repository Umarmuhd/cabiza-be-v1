import { Request, Response } from "express";
import PostModel from "../model/post.model";
import { createPost } from "../service/post.service";
import log from "../utils/logger";

export async function createNewPostHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    const post = await createPost({ ...req.body, user: user_id });

    return res.status(201).json({
      success: true,
      message: "post created successful",
      data: { post },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getUserPostsHandler(req: Request, res: Response) {
  const user_id = req.params.user_id;

  try {
    const posts = await PostModel.find({ user: user_id });

    return res
      .status(200)
      .json({ success: true, message: "post list", data: { posts } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function deletePostsHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const post_id = req.params.post_id;

  try {
    const post = await PostModel.findById(post_id);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "post not found" });
    }

    if (post.user != user_id) {
      return res.status(403).json({
        success: false,
        message: "user unauthorized to perform action",
      });
    }

    const delete_post = await PostModel.findByIdAndDelete(post._id);

    return res.status(200).json({
      success: true,
      message: "post deleted successful",
      data: { post: delete_post },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function getSinglePostHandler(req: Request, res: Response) {
  const post_id = req.params.post_id;

  try {
    if (!post_id) {
      return res
        .status(400)
        .json({ message: "invalid post id", success: false });
    }

    const post = await PostModel.findOne({ _id: post_id })
      .populate("user", "full_name profile_picture _id")
      .exec();

    if (!post) {
      return res
        .status(400)
        .json({ message: "post not found", success: false });
    }

    return res
      .status(200)
      .json({ success: true, message: "post found", data: { post } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function publishingHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;
  const post_id = req.params.post_id;

  try {
    const post = await PostModel.findById(post_id);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "post not found" });
    }

    if (post.user != user_id) {
      return res.status(403).json({
        success: false,
        message: "user unauthorized to perform action",
      });
    }

    post.published = !post.published;
    await post.save();

    return res.status(200).json({
      success: true,
      message: `post ${
        post.published ? "published" : "unpublished"
      } successful`,
      data: { post },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}
