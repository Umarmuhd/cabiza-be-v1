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

class UserPriced {
  @prop({})
  public user_priced?: boolean;

  @prop({ default: 0 })
  public min_percent?: number;

  @prop({ default: 0 })
  public max_percent?: number;
}

enum CategoriesEnum {
  "Education",
  "Crafts & DIY",
  "Health & Fitness",
}
enum CurrencyEnum {
  "Naira - ₦",
  "Dollars - $",
  "Euro - €",
}
enum ProductTypeEnum {
  "Instant",
  "Presale",
  "Membership",
}

export class Product {
  @prop({ required: true, unique: true, default: () => `product_${nanoid()}` })
  product_id: string;

  @prop({ ref: () => User, required: true })
  user: Ref<User>;

  @prop()
  cover_image: string;

  @prop()
  thumbnail: string;

  @prop()
  file: string;

  @prop()
  redirect_url: string;

  @prop({})
  url: string;

  @prop({})
  description: string;

  @prop({})
  summary: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, default: 0 })
  price: number;

  @prop({ ref: () => UserPriced })
  user_priced: Ref<UserPriced>; //

  @prop()
  call_to_action: string;

  @prop()
  contains_physical: boolean;

  @prop({ enum: CategoriesEnum, default: 0 })
  categories: CategoriesEnum;

  @prop({ enum: ProductTypeEnum, default: 0 })
  product_type: ProductTypeEnum;

  @prop({ enum: CurrencyEnum, default: 1 })
  currency: CurrencyEnum;

  @prop({ ref: () => Affiliate })
  affiliate: Ref<Affiliate>;

  @prop({ default: false })
  published: boolean;
}

const ProductModel = getModelForClass(Product, {
  schemaOptions: {
    timestamps: true,
  },
});

export default ProductModel;
