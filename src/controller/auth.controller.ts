import { Request, Response } from "express";
import { get, omit } from "lodash";
import { addMinutes, isAfter } from "date-fns";
import UserModel from "../model/user.model";
import { CreateSessionInput } from "../schema/auth.schema";
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";
import { findUserByEmail, findUserById } from "../service/user.service";
import { verifyJwt } from "../utils/jwt";
import { CreateUserInput, VerifyUserInput } from "../schema/user.schema";
import { nanoid } from "nanoid";
import WalletModel from "../model/wallet.model";
const Mailer = require("../utils/mailer");

export async function signupUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const { full_name, email, password } = req.body;

  try {
    const user = await new UserModel({
      full_name,
      email,
      password,
      activation_code: {
        token: nanoid(),
        expires_at: addMinutes(new Date(), 15),
      },
      stripe: {
        account_id: null,
      },
    });

    const wallet = await WalletModel.create({ user: user._id });

    const activationLink = `https://cabiza-fe-v1.vercel.app/auth/verify-email?token=${user.activation_code.token}&id=${user._id}`;

    await Mailer.send("confirm-account", user, {
      activationLink,
      subject: "Welcome to Cabiza",
    });

    await user.save();

    return res
      .status(200)
      .json({ message: "user created successfully", success: true });
  } catch (e: any) {
    if (e.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Account already exists" });
    }

    return res.status(500).json({ success: false, message: e });
  }
}

export async function accountActivation(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const id = req.body.id;
  const activation_code = req.body.activation_code;

  const user = await findUserById(id);

  if (!user) {
    return res
      .status(400)
      .json({ message: "could not verify user", success: false });
  }

  if (user.verified) {
    return res
      .status(400)
      .json({ message: "user is already verified", success: false });
  }

  if (isAfter(new Date(), new Date(user.activation_code.expires_at!))) {
    return res
      .status(200)
      .json({ success: false, message: "activation code expired ⌚" });
  }

  if (user.activation_code.token === activation_code) {
    user.verified = true;
    user.activation_code.token = null;
    user.activation_code.expires_at = null;

    await user.save();

    const accessToken = signAccessToken(user);

    const refreshToken = await signRefreshToken({ userId: user._id });

    return res.status(200).json({
      message: "user is successfully verified",
      success: true,
      accessToken,
      refreshToken,
    });
  }

  return res
    .status(500)
    .json({ message: "could not verify user", success: false });
}

export async function loginUserHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Invalid email or password";
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(400).json({ message, success: false });
  }

  if (!user.verified) {
    return res
      .status(400)
      .json({ success: false, message: "Please verify your email" });
  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.status(401).json({ message, success: false });
  }

  const accessToken = signAccessToken(user);

  const refreshToken = await signRefreshToken({ userId: user._id });

  return res.status(200).json({
    success: true,
    user: omit(user.toJSON(), ["password", "activation_code"]),
    accessToken,
    refreshToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = get(req, "headers.x-refresh");

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send("Could not refresh access token");
  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).send("Could not refresh access token");
  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send("Could not refresh access token");
  }

  const accessToken = signAccessToken(user);

  return res.send({ accessToken });
}

export async function refreshAccessToken(req: Request, res: Response) {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ success: false, message: "invalid refresh token" });
  }

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send("Could not refresh access token");
  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).send("Could not refresh access token");
  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send("Could not refresh access token");
  }

  const accessToken = signAccessToken(user);

  return res.status(200).json({
    success: true,
    token: accessToken,
    expires_in: 10 * 60 * 60 * 1,
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      profile_picture: user.profile_picture,
    },
  });
}
