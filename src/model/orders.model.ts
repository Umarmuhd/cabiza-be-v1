import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";
import { Product } from "./product.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export class Order {
  @prop({ required: true, unique: true, default: () => `order_${nanoid()}` })
  order_id: string;

  @prop({ required: true })
  user: {
    full_name: string;
    email: string;
  };

  @prop({ ref: () => Product })
  product: Ref<Product>;

  @prop({})
  discount: string;

  @prop({})
  pay_link: string;

  @prop({ required: true, default: 0 })
  final_price: number;

  @prop({ default: 0 })
  price: number;

  @prop({ default: null })
  discount_code: string | null;

  @prop({ default: false })
  order_paid: boolean;
}

const OrderModel = getModelForClass(Order, {
  schemaOptions: {
    timestamps: true,
  },
});

export default OrderModel;
