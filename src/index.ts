import { ApolloServer } from "apollo-server-express";
import RedisConnect from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import redis from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME_, PORT } from "./constants";
import { client } from "./constants/index";
import { HelloResolver, PostResolver, UserResolver } from "./resolvers";
import { createConnection } from "typeorm";
import { Post, User } from "./entities";

const main = async () => {
  await createConnection({
    type: "postgres",
    username: "postgres",
    password: "1512",
    database: "benreddit2",
    entities: [Post, User],
    logging: true,
    synchronize: true,
  });
  // const orm = await MikroORM.init(mikroORMConfig);
  // await orm.getMigrator().up();
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
    context: ({ req, res }) => ({ req, res }),
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
