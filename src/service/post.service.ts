import PostModel, { Post } from "../model/post.model";

export async function createPost(input: Partial<Post>) {
  return PostModel.create(input);
}
