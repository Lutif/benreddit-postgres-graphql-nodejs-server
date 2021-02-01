import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type ApolloContext {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}