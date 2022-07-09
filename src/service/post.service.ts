import PostModel, { Post } from "../model/post.model";

export async function createPost(input: Partial<Post>) {
  return PostModel.create(input);
}

export function findPostById(id: string) {
  return PostModel.findById(id);
}
