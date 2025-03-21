'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { weatherService, WeatherResponse, ForecastResponse } from '../services/weatherService';
import { setCurrentWeather, setForecast, setLoading, setError } from '../store/slices/weatherSlice';
import { RootState } from '../store/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const WeatherCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const Weather: React.FC = () => {
  const dispatch = useDispatch();
  const { currentWeather, forecast, loading, error } = useSelector(
    (state: RootState) => state.weather
  );
  const [city, setCity] = React.useState('India');

  const transformWeatherData = (data: WeatherResponse) => ({
    temperature: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.main.wind_speed,
    condition: data.weather[0].description,
    location: data.name,
  });

  const transformForecastData = (data: ForecastResponse) =>
    data.list.map((item) => ({
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.main.wind_speed,
      condition: item.weather[0].description,
      location: city,
    }));

  const fetchWeatherData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const [current, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(city),
        weatherService.getForecast(city),
      ]);

      dispatch(setCurrentWeather(transformWeatherData(current)));
      dispatch(setForecast(transformForecastData(forecastData)));
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      dispatch(setError(err.message || 'Failed to fetch weather data'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData();
  };

  const formatChartData = () => {
    if (!forecast) return [];
    return forecast.map((item) => ({
      time: new Date().toLocaleTimeString(),
      temperature: item.temperature,
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Weather Dashboard
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentWeather && (
            <Grid item xs={12} md={4}>
              <WeatherCard>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Current Weather
                  </Typography>
                  <Typography variant="h3">
                    {Math.round(currentWeather.temperature)}°C
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    {currentWeather.condition}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography>
                      Humidity: {currentWeather.humidity}%
                    </Typography>
                    <Typography>
                      Wind Speed: {currentWeather.windSpeed} m/s
                    </Typography>
                  </Box>
                </CardContent>
              </WeatherCard>
            </Grid>
          )}

          {forecast.length > 0 && (
            <Grid item xs={12} md={8}>
              <WeatherCard>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Temperature Forecast
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#8884d8"
                          name="Temperature (°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </WeatherCard>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Weather; 