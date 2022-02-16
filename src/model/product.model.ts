import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

enum AudienceEnum {
  "Everyone",
  "Followers only",
  "Customers only",
  "Affiliates only",
}
enum ChannelEnum {
  "Send Email",
  "Post to profile",
}
enum EngagementEnum {
  "Allow comments",
  "Allow Likes",
}

export class Product {
  @prop({ required: true, unique: true, default: () => `product_${nanoid()}` })
  product_id: string;

  @prop({ ref: () => User })
  user: Ref<User>;

  @prop({ required: true })
  title: string;

  @prop({ required: true })
  description: string;

  @prop()
  call_to_action: string;

  @prop()
  attachment: string;

  @prop({ enum: AudienceEnum, default: 0 })
  audience: AudienceEnum;

  @prop({ enum: ChannelEnum, default: 1 })
  channel: ChannelEnum;

  @prop({ enum: EngagementEnum, default: 0 })
  engagement: EngagementEnum;

  @prop({ ref: () => User })
  likes?: Ref<User>[];

  @prop({})
  scheduled: Date;
}

const ProductModel = getModelForClass(Product, {
  schemaOptions: {
    timestamps: true,
  },
});

export default ProductModel;
