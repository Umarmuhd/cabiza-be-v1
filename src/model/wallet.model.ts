import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export class Wallet {
  @prop({ required: true, unique: true, default: () => `wallet_${nanoid()}` })
  wallet_id: string;

  @prop({ ref: () => User, required: true })
  user: Ref<User>;

  @prop({ required: true, default: 0 })
  balance: number;

  @prop({ default: 0 })
  earnings: number;

  @prop({ default: 0 })
  affiliate_earnings: number;

  @prop({ default: 0 })
  affiliate_balance: number;

  @prop({ default: 0 })
  referral_earnings: number;
}

const WalletModel = getModelForClass(Wallet, {
  schemaOptions: {
    timestamps: true,
  },
});

export default WalletModel;
