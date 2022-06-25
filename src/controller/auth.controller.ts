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
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../service/user.service";
import { verifyJwt } from "../utils/jwt";
import { CreateUserInput, VerifyUserInput } from "../schema/user.schema";
import { nanoid } from "nanoid";
import WalletModel from "../model/wallet.model";
import log from "../utils/logger";
const Mailer = require("../utils/mailer");

export async function signupUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const { full_name, email, password } = req.body;

  try {
    const user = await createUser({ full_name, email, password });

    user.activation_code = {
      token: nanoid(),
      expires_at: addMinutes(new Date(), 15),
    };

    await WalletModel.create({ user: user._id });

    await user.save();

    const activationLink = `https://app.cabiza.net/auth/verify-email?token=${user.activation_code.token}&id=${user._id}`;

    await Mailer.send("confirm-account", user, {
      activationLink,
      subject: "Welcome to Cabiza",
    });

    return res
      .status(200)
      .json({ message: "User created successfully", success: true });
  } catch (e: any) {
    if (e.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
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

export async function refreshAccessToken(req: Request, res: Response) {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    res.status(400).json({ success: false, message: "Invalid refresh token" });
    return;
  }

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    res
      .status(401)
      .json({ success: false, message: "Could not refresh access token" });
    return;
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

  const refresh_token = await signRefreshToken({ userId: user._id });

  return res.status(200).json({
    success: true,
    accessToken: accessToken,
    refreshToken: refresh_token,
    expires_in: 10 * 60 * 60 * 1,
    user: user,
  });
}

export async function forgetPasswordHandler(req: Request, res: Response) {
  try {
    const email = req.body.email;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide your email" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found please signup" });
    }

    const token = nanoid();

    user.password_reset = { token, expires_at: addMinutes(new Date(), 15) };

    await Mailer.send("forgot-password", user, {
      resetLink: `https://app.cabiza.net/auth/reset-password?token=${token}&email=${email}`,
      subject: "forget your password",
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset code has been sent to ${email}`,
    });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, password, email } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Please provide password reset token",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password reset token" });
    }

    if (isAfter(new Date(), new Date(user.password_reset.expires_at!))) {
      return res
        .status(202)
        .json({ success: false, message: "Password reset token expired" });
    }

    if (user.password_reset.token !== token) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password reset code" });
    }

    user.password = password;
    user.password_reset.token = null;
    user.password_reset.expires_at = null;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User password reset successful" });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updatePasswordHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  const { current_password, new_password } = req.body;

  const user = await UserModel.findById(user_id).select("+password");
  if (!user) {
    return res.status(400).json({ success: false, message: "user not found" });
  }

  if (current_password === new_password) {
    return res.status(400).json({
      success: false,
      message: "current password should not be the same as new password",
    });
  }

  const isPasswordMatched = await user.validatePassword(current_password);

  if (!isPasswordMatched) {
    return res
      .status(400)
      .json({ success: false, message: "current password is incorrect" });
  }

  user.password = new_password;
  await user.save();
  res.status(200).json({ success: true, message: "password updated success!" });
}
