import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import { Post, User } from "./entities";
import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "benreddit",
  type: "postgresql",
  user: "postgres",
  password: "1512",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
