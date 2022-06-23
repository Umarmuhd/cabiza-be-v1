import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
  pre,
  DocumentType,
  Ref,
  index,
} from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import log from "../utils/logger";

export const privateFields = [
  "password",
  "__v",
  "activation_code",
  "password_reset_code",
  "verified",
];

@pre<User>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  const hash = await bcrypt.hashSync(this.password, salt);

  this.password = hash;

  return next();
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({ lowercase: true, required: true, unique: true })
  email: string;

  @prop({ required: true })
  full_name: string;

  @prop({})
  first_name: string;

  @prop({})
  last_name: string;

  @prop()
  username: string;

  @prop({})
  profile_picture: string;

  @prop({})
  phone_number: string;

  @prop({})
  bio: string;

  @prop({})
  category: string;

  @prop()
  address: {
    street_name: string;
    postal_code: string;
    city: string;
    country: string;
  };

  @prop({})
  birthday: string;

  @prop({})
  bvn: string;

  @prop({ required: true })
  password: string;

  @prop()
  activation_code: {
    token: string | null;
    expires_at: Date | null;
  };

  @prop()
  password_reset: {
    token: string | null;
    expires_at: Date | null;
  };

  @prop({ default: false })
  verified: boolean;

  @prop()
  stripe: {
    account_id: string | null;
    seller: string | null;
    session: string | null;
  };

  @prop()
  flutterwave: {
    account_id: string | null;
  };

  @prop()
  paypal: {
    email: string | null;
  };

  @prop()
  bank_account?: {
    bank_code: string;
    account_name: string;
    account_number: string;
    bank_name: string;
  };

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (e) {
      log.error(e, "Could not validate password");
      return false;
    }
  }
}

const UserModel = getModelForClass(User);

export default UserModel;
