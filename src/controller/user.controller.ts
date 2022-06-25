import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { addMinutes, isAfter } from "date-fns";
import { omit } from "lodash";
import UserModel from "../model/user.model";
import WalletModel from "../model/wallet.model";
import { CreateUserInput, VerifyUserInput } from "../schema/user.schema";
import { findUserById } from "../service/user.service";
import log from "../utils/logger";
import { signAccessToken, signRefreshToken } from "../service/auth.service";
import Stripe from "stripe";
import queryString from "query-string";
import fs from "fs";
import aws from "../utils/aws";
const Mailer = require("../utils/mailer");

export async function updateUserAvatar(req: Request, res: Response) {
  const userId = res.locals.user._id;

  const user = await UserModel.findById({ _id: userId });

  if (!user) {
    return res.status(409).send({
      success: false,
      message: "You Are not authorized to make this request",
    });
  }

  const files = req.files as Express.Multer.File[];

  if (files) {
    const file = fs.readFileSync(files[0].path);

    aws
      .upload(
        {
          Bucket: "cabizacore",
          ACL: "public-read",
          Key: `avatars/${user.username}/${files[0].filename}`,
          Body: file,
        },
        {
          partSize: 10 * 1024 * 1024,
          queueSize: 10,
        }
      )
      .send((err, data) => {
        if (err) return res.status(500).send(err);

        fs.unlink(files[0].path, (err) => {
          console.log(err);
          console.log("file deleted");
        });

        user.profile_picture = data.Location;
        user.save();

        res.status(201).json({
          success: true,
          message: "Image upload successful",
          data: { picture: user.profile_picture },
        });
      });
  } else {
    return res
      .status(200)
      .json({ success: false, message: "image upload failed" });
  }
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  res
    .status(200)
    .json({ success: true, message: "user data", user: res.locals.user });
  return;
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

    if (req.file) {
      const path = req.file.path;
      const photo = fs.readFileSync(path);

      await aws
        .upload(
          {
            Bucket: "cabizacore",
            ACL: "public-read",
            Key: `avatars/${user.email}/${req.file.filename}`,
            Body: photo,
          },
          {
            partSize: 10 * 1024 * 1024,
            queueSize: 10,
          }
        )
        .send(async (err, data) => {
          fs.unlink(path, (err) => {
            console.log(err);
            console.log("file deleted");
          });

          if (err) {
            console.log(err);
          }

          user.username = username;
          user.profile_picture = data.Location;
          user.bio = bio;
          user.category = category;
          user.address.country = country;

          await user.save();

          return res
            .status(200)
            .json({ success: true, message: "user successfully onboard" });
        });
    }

    user.username = username;
    user.profile_picture = `https://avatars.dicebear.com/api/initials/${username}.png`;
    user.bio = bio;
    user.category = category;
    user.address.country = country;

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

export async function connectStripeHandler(req: Request, res: Response) {
  try {
    const user_id = res.locals.user._id;

    const user = await UserModel.findById(user_id).exec();

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    const stripe = new Stripe(
      "sk_test_51HrwuMAaXQxa9dQPWMwKxsVqba0KoONYHauT6lrf7FPknzjBEklwQKUnnor1edH8AA3X7nbL257SZwkwbh7x3Bwa00auecfjQQ",
      {
        apiVersion: "2020-08-27",
      }
    );

    if (!user?.stripe?.account_id) {
      const account = await stripe.accounts.create({ type: "express" });
      console.log("ACCOUNT => ", account.id);
      user.stripe.account_id = account.id;
      await user.save();
    }

    let account_link = await stripe.accountLinks.create({
      account: user?.stripe?.account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL || "localhost",
      return_url: process.env.STRIPE_REDIRECT_URL || "localhost",
      type: "account_onboarding",
    });

    account_link = Object.assign(account_link, {
      "stripe_user[email]": user.email,
    });

    return res.status(200).json({
      success: true,
      message: "stripe on boarding",
      data: {
        url: `${account_link.url}?${queryString.stringify(account_link)}`,
      },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserBalanceHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    const wallet = await WalletModel.findOne({ user: user_id });

    if (!wallet) {
      res.status(500).json({ success: false, message: "Something went wrong" });
      return;
    }

    return res.status(200).json({
      success: true,
      message: "wallet",
      data: { wallet },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUserProfileHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    let user = await UserModel.findById(user_id).exec();
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    user = await UserModel.findByIdAndUpdate(user._id, req.body);

    res.status(200).json({
      success: true,
      message: "paypal payment method added",
      data: { user },
    });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addBankAccountHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const { account_name, account_number, bank_code, bank_name } = req.body;

  try {
    const user = await UserModel.findById(user_id).exec();

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    user.bank_account = { bank_code, account_name, account_number, bank_name };

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "bank account saved" });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
