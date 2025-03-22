import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  name: string;
}

export interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  time?: string;
}

export const weatherService = {
  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }

      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Weather API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch current weather data');
    }
  },

  async getForecast(city: string): Promise<ForecastResponse> {
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }

      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Forecast API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
    }
  },

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherResponse> {
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }

      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Weather API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch weather data by coordinates');
    }
  },
}; 