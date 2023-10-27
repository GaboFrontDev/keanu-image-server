import responseCachePlugin from "apollo-server-plugin-response-cache";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServer, ContextFunction } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import { StandaloneServerContextFunctionArgument } from "@apollo/server/standalone";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";

import resolvers from "./resolvers";
import { DataSourceContext } from "./types/DataSourceContext";
import { ImageApi } from "./datasources/ImageApi";

const port = process.env.PORT ?? "4001";

const context: ContextFunction<
  [StandaloneServerContextFunctionArgument],
  DataSourceContext
> = async () => {
  return {
    imageApi: new ImageApi(),
  };
};

async function main() {
  let typeDefs = gql(
    readFileSync("schema.graphql", {
      encoding: "utf-8",
    })
  );
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins: [
      responseCachePlugin() as any,
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  await server.start();
  app.use("/public", express.static(path.join(__dirname, "../public")));
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context,
    })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}

main();
