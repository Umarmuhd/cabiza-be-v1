import { User } from "../../model/user.model";
import ReferralModel, { Referral } from "./referral.model";

export async function createReferral(input: Partial<Referral>) {
  return ReferralModel.create(input);
}

export function findByReferralId(referralId: Pick<Referral, "referral_id">) {
  return ReferralModel.findOne({ referral_id: referralId });
}

export function findUserReferrals(userId: string) {
  return ReferralModel.find({ referred_by: userId });
}
