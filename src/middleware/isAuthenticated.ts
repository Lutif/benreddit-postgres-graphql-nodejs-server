import { ApolloContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuthenticated: MiddlewareFn<ApolloContext> = (
  { context },
  next
) => {
  if (!context.req.session.userId) {
    throw new Error("Not Authenticated");
  }
  return next();
};
