import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";
import { Product } from "./product.model";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export class Affiliate {
  @prop({ required: true, unique: true, default: () => `cabiza_${nanoid()}` })
  affiliate_id: string;

  @prop({ ref: () => User, required: true })
  user: Ref<User>;

  @prop({ required: true, default: 0 })
  sales: number;

  @prop({ ref: () => Product })
  product: Ref<Product>;

  @prop({ default: true })
  active: boolean;
}

const AffiliateModel = getModelForClass(Affiliate, {
  schemaOptions: {
    timestamps: true,
  },
});

export default AffiliateModel;
