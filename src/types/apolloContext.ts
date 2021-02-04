import { Request, Response } from "express";
import session from "express-session";

export type ApolloContext = {
  req: Request & {
    session: session.Session &
      Partial<session.SessionData> & { userId: number };
  };
  res: Response;
};
