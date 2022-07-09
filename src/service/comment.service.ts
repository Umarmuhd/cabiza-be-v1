import CommentModel, { Comment } from "../model/comment.model";

export async function createComment(input: Partial<Comment>) {
  return CommentModel.create(input);
}

export async function findComments() {
  return CommentModel.find().lean();
}
