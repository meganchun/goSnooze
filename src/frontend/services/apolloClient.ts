import { ApolloClient, InMemoryCache } from "@apollo/client";

export const trainLines = () => {
  const uri = "";
  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
};
