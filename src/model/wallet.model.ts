import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export class Wallet {
  @prop({ required: true, unique: true, default: () => `wallet_${nanoid()}` })
  wallet_id: string;

  @prop({ ref: () => User })
  user: Ref<User>;

  @prop({ required: true, default: 0 })
  balance: number;

  @prop({ default: 0 })
  earnings: number;
}

const WalletModel = getModelForClass(Wallet, {
  schemaOptions: {
    timestamps: true,
  },
});

export default WalletModel;
