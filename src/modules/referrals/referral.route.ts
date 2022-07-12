import express from "express";

import requireUser from "../../middleware/requireUser";
import {
  getUserReferralsHandler,
  sendReferralInviteHandler,
} from "./referral.controller";

const router = express.Router();

router.get("/me", requireUser, getUserReferralsHandler);

router.post("/invite", requireUser, sendReferralInviteHandler);

export default router;
