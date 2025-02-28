import { GO_TRANSIT_API_BASE_URL, API_KEY, TRAIN_LINES, STOP_INFO } from "@env";

import { ApolloClient, InMemoryCache } from "@apollo/client";
import dayjs from "dayjs";

const baseURL = GO_TRANSIT_API_BASE_URL;
const key = API_KEY;
const currentDate = dayjs().format("YYYYMMDD");

export const trainLines = () => {
  const uri = baseURL + TRAIN_LINES + currentDate + key;
  console.log(uri);
  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
};

export const lineStops = (lineCode: string, direction: string) => {
  const uri = `${baseURL}${TRAIN_LINES}${currentDate}/${lineCode}/${direction}${key}`;
  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
};

export const stopInfo = (stopCode: string) => {
  const uri = `${baseURL}${STOP_INFO}${stopCode}${key}`;
  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
};
