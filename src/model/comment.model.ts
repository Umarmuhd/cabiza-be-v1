import { getModelForClass, mongoose, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";
import { Post } from "./post.model";

import { User } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export class Comment {
  @prop({ required: true, unique: true, default: () => `comment_${nanoid()}` })
  comment_id: string;

  @prop({ ref: () => User })
  user: Ref<User>;

  @prop({ ref: () => Post })
  post: Ref<Post>;

  @prop({ required: true })
  body: string;

  @prop({ ref: () => User })
  likes?: Ref<User>[];

  @prop({ default: false })
  published: boolean;
}

const CommentModel = getModelForClass(Comment, {
  schemaOptions: {
    timestamps: true,
  },
});

export default CommentModel;
