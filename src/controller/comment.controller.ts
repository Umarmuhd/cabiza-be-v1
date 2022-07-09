import { Request, Response } from "express";
import { createComment } from "../service/comment.service";
import { findPostById } from "../service/post.service";
import { findUserById } from "../service/user.service";
import log from "../utils/logger";

export async function createCommentHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;
  const post_id = req.params.post_id;

  try {
    const { body } = req.body;

    const post = await findPostById(post_id);
    if (!post) {
      res.status(400).json({ success: false, message: "Post not found" });
      return;
    }

    const user = await findUserById(user_id);
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const comment = await createComment({
      user: user_id,
      post: post._id,
      body,
    });

    if (!comment) {
      res.status(400).json({ success: false, message: "Comment not found" });
      return;
    }

    return res
      .status(201)
      .json({ success: true, message: "Comment created", data: { comment } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}
