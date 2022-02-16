import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { addMinutes, isAfter } from "date-fns";
import UserModel from "../model/user.model";
import { CreateUserInput, VerifyUserInput } from "../schema/user.schema";
import { findUserById } from "../service/user.service";
import log from "../utils/logger";
import { signAccessToken, signRefreshToken } from "../service/auth.service";
const Mailer = require("../utils/mailer");

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.send(res.locals.user);
}

export async function onBoardingHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const { username, bio, category, country } = req.body;

  try {
    const user = await UserModel.findById(user_id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    user.username = username;
    user.profile_picture = `https://avatars.dicebear.com/api/initials/${username}.png`;
    user.bio = bio;
    user.category = category;
    user.country = country;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "user successfully onboard" });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}

export async function findUserByUsername(req: Request, res: Response) {
  const username = req.params.username;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "user found", data: { user } });
  } catch (error: any) {
    log.error(error);
    return res.status(409).json({ success: false, message: error.message });
  }
}
