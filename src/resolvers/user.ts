import { User } from "src/entities";
import { ApolloContext } from "src/types";
import { argon2 } from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => String)
  register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: ApolloContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    return "Hello apollo!!";
  }
}
