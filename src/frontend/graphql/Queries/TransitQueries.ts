import { gql } from "@apollo/client";

export const GET_AVAILABLE_TRAIN_LINES = gql`
  query GetTrainLines {
    allLines {
      line {
        name
        code
        isBus
        isTrain
        variant {
          code
          display
          direction
        }
      }
    }
  }
`;
export const GET_STOPS_ON_LINE = gql`
  query GetLineStops($lineCode: String!) {
    lines(lineCode: $lineCode) {
      code
      direction
      display
      stop {
        code
        order
        name
        type
        isMajor
      }
    }
  }
`;
export const GET_STOP_DETAILS = gql`
  query GetStopDetails {
    stop {
      ZoneCode
      StreetNumber
      Intersection
      City
      StreetName
      Code
      StopName
      StopNameFr
      IsBus
      IsTrain
      Longitude
      Latitude
    }
  }
`;
