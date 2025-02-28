export type Line = {
  Code: string;
  IsBus: boolean;
  IsTrain: boolean;
  Name: string;
  Variant: Variant[];
};
export type Variant = {
  Code: number;
  Display: string;
  Direction: string;
};
export type Stop = {
  Code: string;
  StreetNumber: string;
  Intersection: string;
  City: string;
  StreetName: string;
  StopName: string;
  Longitude: number;
  Latitude: number;
};
export type Alert = {
  title: string;
  message: string;
  category: string;
  date: string;
};
