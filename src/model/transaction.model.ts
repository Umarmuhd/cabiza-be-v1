import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

enum TransactionType {
  "Credit",
  "Debit",
}
enum Purpose {
  "Refund",
  "Order",
}

export class Transaction {
  @prop({ required: true, unique: true, default: () => `trxn_${nanoid()}` })
  transaction_id: string;

  @prop({ ref: () => User })
  user: Ref<User>;

  @prop({ enum: TransactionType })
  trxn_type: TransactionType;

  @prop({ enum: Purpose })
  purpose: Purpose;

  @prop({ required: true, default: 0 })
  balance_before: number;

  @prop({ required: true, default: 0 })
  balance_after: number;

  @prop({ required: true })
  metadata: {
    balance: string;
    order: string;
  };
}

const TransactionModel = getModelForClass(Transaction, {
  schemaOptions: {
    timestamps: true,
  },
});

export default TransactionModel;
