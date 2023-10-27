import { ImageApi } from "../datasources/ImageApi";

//This interface is used with graphql-codegen to generate types for resolvers context
export interface DataSourceContext {
  imageApi?: ImageApi
}
