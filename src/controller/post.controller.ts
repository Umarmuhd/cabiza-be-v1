import { Request, Response } from "express";
import PostModel from "../model/post.model";
import { createPost } from "../service/post.service";
import log from "../utils/logger";
import aws from "../utils/aws";
import fs from "fs";

export async function createNewPostHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const body = req.body;

  try {
    const channel = [];
    req.body.send_email === "true" && channel.push(0);
    req.body.post_to_profile === "true" && channel.push(1);

    const engagements = [];
    req.body.allow_comments === "true" && engagements.push(0);
    req.body.allow_likes === "true" && engagements.push(1);

    const post = await createPost({
      ...body,
      user: user_id,
      channel,
      engagements,
    });

    return res
      .status(201)
      .json({ success: true, message: "post created", data: { post } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function updatePostHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const post_id = req.params.post_id;

  const attachment = req.file;

  const { title, description, call_to_action, audience } = req.body;

  const channel = [];
  req.body.send_email === "true" && channel.push(0);
  req.body.post_to_profile === "true" && channel.push(1);

  const engagements = [];
  req.body.allow_comments === "true" && engagements.push(0);
  req.body.allow_likes === "true" && engagements.push(1);

  try {
    const post = await PostModel.findOne({ post_id });
    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }

    if (post.user?.toString() !== user_id) {
      return res
        .status(403)
        .json({ success: false, message: "user unauthorized" });
    }

    post.title = title;
    post.description = description;
    post.call_to_action = call_to_action;
    post.audience = audience;
    post.channel = channel;
    post.engagements = engagements;

    if (req.file) {
      aws
        .upload(
          {
            Bucket: "cabizacore",
            ACL: "public-read",
            Key: `post/${post.post_id}/${attachment?.filename}`,
            //@ts-ignore
            Body: fs.readFileSync(attachment?.path),
          },
          {
            partSize: 10 * 1024 * 1024,
            queueSize: 10,
          }
        )
        .send(async (error: any, data: any) => {
          if (error) {
            return res
              .status(400)
              .json({ success: false, message: error.message });
          }

          post.attachment = data.Location;

          await post.save();

          return res
            .status(200)
            .json({ success: true, message: "post updated", data: { post } });
        });
    }

    await post.save();

    return res
      .status(200)
      .json({ success: true, message: "post updated", data: { post } });
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
      .populate("user", "full_name profile_picture _id username")
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
      message: `post ${post.published ? "published" : "unpublished"}`,
      data: { post },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}
