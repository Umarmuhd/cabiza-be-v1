import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

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

  @prop({})
  image: string;

  @prop({})
  description: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, default: 0 })
  price: number;

  @prop({ default: 0 })
  total_purchase: number;

  @prop()
  call_to_action: string;

  @prop()
  contains_physical: boolean;

  @prop({ enum: CategoriesEnum, default: 0 })
  categories: CategoriesEnum;

  @prop({ enum: CurrencyEnum, default: 1 })
  currency: CurrencyEnum;
}

const ProductModel = getModelForClass(Product, {
  schemaOptions: {
    timestamps: true,
  },
});

export default ProductModel;
