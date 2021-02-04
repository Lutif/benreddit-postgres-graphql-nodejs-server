import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts() {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int)
    id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    const post = await Post.create({ title }).save();
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("title", { nullable: true }) title: string,
    @Arg("id") id: number
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (title) {
      post.title = title;
      await post.save();
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
