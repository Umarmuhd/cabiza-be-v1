import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

class Affiliate {
  @prop()
  public can_affiliate?: boolean;

  @prop({ default: 30 })
  public percent?: number;
}

enum CategoriesEnum {
  "Classic",
  "Pre Order",
  "Membership",
}
enum CurrencyEnum {
  "Naira - ₦",
  "Dollars - $",
  "Euro - €",
}

export class Product {
  @prop({ required: true, unique: true, default: () => `product_${nanoid()}` })
  product_id: string;

  @prop({ ref: () => User })
  user: Ref<User>;

  @prop()
  cover_image: string;

  @prop()
  thumbnail: string;

  @prop()
  file: string;

  @prop()
  redirect_url: string;

  @prop({ required: true })
  url: string;

  @prop({})
  description: string;

  @prop({})
  summary: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, default: 0 })
  price: number;

  @prop({ default: false })
  user_priced: boolean;

  @prop()
  call_to_action: string;

  @prop()
  contains_physical: boolean;

  @prop({ enum: CategoriesEnum, default: 0 })
  categories: CategoriesEnum;

  @prop({ enum: CurrencyEnum, default: 1 })
  currency: CurrencyEnum;

  @prop({ ref: () => Affiliate })
  affiliate: Ref<Affiliate>; //
}

const ProductModel = getModelForClass(Product, {
  schemaOptions: {
    timestamps: true,
  },
});

export default ProductModel;
