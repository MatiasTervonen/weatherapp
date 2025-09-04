export interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  windGust?: number | null;
  rainProp?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  smartData: number | null;
  sunrise?: string; 
  sunset?: string; 
}
