import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, PORT } from "./constants";
import mikroORMConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver, PostResolver } from "./resolvers";

const main = async () => {
  const orm = await MikroORM.init(mikroORMConfig);
  await orm.getMigrator().up();
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });
  apolloServer.applyMiddleware({ app });
  app.get("/", (_, res) => {
    res.send("It works");
  });
  app.listen(PORT, () =>
    console.log("server started at http://localhost:" + PORT)
  );
};
main();
