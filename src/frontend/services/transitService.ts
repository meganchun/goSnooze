import axios from "axios";
import {
  GO_TRANSIT_API_BASE_URL,
  API_KEY,
  TRAIN_LINES,
  LINE_STOPS,
  STOP_INFO,
} from "@env";
import dayjs from "dayjs";

const currentDate = dayjs().format("YYYYMMDD");

const api = axios.create({
  baseURL: GO_TRANSIT_API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get all available lines
export const getLines = async () => {
  try {
    const response = await api.get(TRAIN_LINES + currentDate + API_KEY);
    return response.data;
  } catch (error) {
    console.error("Error fetching lines:", error);
    throw error;
  }
};

// Get all stops on line
export const getStopsOnLine = async (lineCode: string, direction: string) => {
  try {
    const response = await api.get(
      `${LINE_STOPS}${currentDate}/${lineCode}/${direction}${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stops:", error);
    throw error;
  }
};

// Get stop details
export const getStopDetails = async (stopCode: string) => {
  try {
    const response = await api.get(`${STOP_INFO}/${stopCode}${API_KEY}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stop details:", error);
    throw error;
  }
};
