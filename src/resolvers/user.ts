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
import { COOKIE_NAME_ } from "../constants";

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
  @Query(() => UserResponse)
  async me(@Ctx() { req }: ApolloContext) {
    const userid = req.session.userId;
    if (!userid) {
      return { errors: [{ field: "user", error: "Unauthorized" }] };
    }
    const user = await User.findOne(userid);
    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: ApolloContext
  ) {
    const errors: FieldError[] = [];
    const userExist = await User.findOne({
      where: { username: options.username },
    });

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
    const user = await User.create({
      username: options.username,
      password: hashedPassword,
    }).save();
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: ApolloContext
  ) {
    const user = await User.findOne({ where: { username: options.username } });
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
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: ApolloContext) {
    res.clearCookie(COOKIE_NAME_);
    return new Promise((resolve) =>
      req.session.destroy((error) => (error ? resolve(false) : resolve(true)))
    );
  }
}
