import { Request, Response } from "express";
import { findUserById } from "../../service/user.service";
import log from "../../utils/logger";
import { findUserReferrals } from "./referral.service";

const Mailer = require("../../utils/mailer");

export async function getUserReferralsHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    const referrals = await findUserReferrals(user_id).populate(
      "user",
      "full_name email username"
    );

    return res.status(200).json({ success: true, data: { referrals } });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function sendReferralInviteHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id;

  try {
    const user = await findUserById(user_id).populate("referral");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //@ts-ignore
    const invitationLink = `https://app.cabiza.net/auth/signup?ref=${user?.referral?.referral_id}`;

    await Mailer.send("referral-invite", user, {
      invitationLink,
      email: user.email,
      subject: "Invite to Cabiza",
    });

    return res
      .status(200)
      .json({ success: true, message: "Invitation sent successful" });
  } catch (error: any) {
    log.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
