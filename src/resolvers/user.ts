import { User } from "../entities";
import { ApolloContext } from "src/types";
import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
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

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  error: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: ApolloContext
  ) {
    const errors: FieldError[] = [];
    const userExist = await em.findOne(User, { username: options.username });
    console.log("user already exist", userExist);

    if (userExist && userExist?.id > -1) {
      errors.push({
        field: "username",
        error: "username taken",
      });
    }
    if (options.password.length < 6) {
      errors.push({
        field: "password",
        error: "password must be atleast 6 characters",
      });
    }
    if (options.username.length < 2) {
      errors.push({
        field: "username",
        error: "username should be atleast 4 characters",
      });
    }
    if (errors.length > 0) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    console.log("user is");
    return { user };
  }

  @Query(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: ApolloContext
  ) {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return { errors: [{ field: "user", error: "Invalid cardentials" }] };
    }
    const isCorrectPassword = await argon2.verify(
      user.password,
      options.password
    );
    if (!isCorrectPassword) {
      return { errors: [{ field: "user", error: "Invalid cardentials" }] };
    }
    return { user };
  }
}
