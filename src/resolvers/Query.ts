import { GraphQLError } from "graphql";
import { Resolvers } from "../__generated__/resolvers-types";

export const Query: Resolvers = {
  Query: {
    image: async (_parent, { width, height, options }, _context, info) => {
      info.cacheControl.setCacheHint({ maxAge: 60 });
      if (!width) {
        throw new GraphQLError("Missing required width param", {
          extensions: {
            code: "INVALID",
            http: { status: 400 },
          },
        });
      }
      if (!_context.imageApi) {
        throw new GraphQLError("imageApi not initialized", {
          extensions: {
            code: "SERVER_ERROR",
            http: { status: 500 },
          },
        });
      }
      try {
        const url = await _context.imageApi?.getImageUrl(
          width,
          height || "",
          options || ""
        );
        return {
          url,
        };
      } catch (error) {
        throw new GraphQLError("Error happened when image was being fetched", {
          extensions: {
            code: "SERVICE_ERROR",
            http: { status: 500 },
          },
        });
      }
    },
  },
};
