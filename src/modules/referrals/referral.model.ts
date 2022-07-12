import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";
import { User } from "../../model/user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export class Referral {
  @prop({ required: true, unique: true, default: () => `ref_${nanoid()}` })
  referral_id: string;

  @prop({ ref: "User", required: false })
  user: Ref<User>;

  @prop({ required: false, default: 0 })
  earnings: number;

  @prop({ ref: "User" })
  referred_by: Ref<User>;

  @prop({ default: true })
  active: boolean;
}

const ReferralModel = getModelForClass(Referral, {
  schemaOptions: {
    timestamps: true,
  },
});

export default ReferralModel;
