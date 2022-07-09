import UserModel, { User } from "../model/user.model";

export function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export function findUserById(id: string) {
  return UserModel.findById(id);
}

export function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export function findUserByUsername(username: string) {
  return UserModel.findOne({ username });
}

export function findUserByReferralId(referralId: Pick<User, "referral_code">) {
  return UserModel.findOne({ referral_code: referralId });
}

export function findUserReferrals(user: string) {
  return UserModel.findOne({ refree: user });
}
