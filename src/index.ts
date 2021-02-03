import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, PORT, COOKIE_NAME_ } from "./constants";
import mikroORMConfig from "./mikro-orm.config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver, PostResolver, UserResolver } from "./resolvers";

import redis from "redis";
import session from "express-session";
import RedisConnect from "connect-redis";
import { client } from "./constants/index";

const main = async () => {
  const orm = await MikroORM.init(mikroORMConfig);
  await orm.getMigrator().up();
  const app = express();

  app.use(
    cors({
      origin: client,
      credentials: true,
    })
  );

  const RedisStore = RedisConnect(session);
  const redisClient = redis.createClient();
  app.use(
    session({
      name: COOKIE_NAME_,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: false, //cookie works for https only
        sameSite: "lax", //csrf
      },
      saveUninitialized: false,
      secret: "SomeRandomeString",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });
  apolloServer.applyMiddleware({ app, cors: false });
  app.get("/", (_, res) => {
    res.send("It works");
  });
  app.listen(PORT, () =>
    console.log("server started at http://localhost:" + PORT)
  );
};
main();
