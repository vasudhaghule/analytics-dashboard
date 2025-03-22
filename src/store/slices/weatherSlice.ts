import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WeatherData } from '@/services/weatherService';

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: WeatherData[];
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  forecast: [],
  loading: false,
  error: null,
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setCurrentWeather: (state, action: PayloadAction<WeatherData>) => {
      state.currentWeather = action.payload;
    },
    setForecast: (state, action: PayloadAction<WeatherData[]>) => {
      state.forecast = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCurrentWeather, setForecast, setLoading, setError } = weatherSlice.actions;
export default weatherSlice.reducer; 