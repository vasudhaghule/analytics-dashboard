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
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { weatherService, WeatherResponse, ForecastResponse, WeatherData } from '../services/weatherService';
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
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const Weather: React.FC = () => {
  const dispatch = useDispatch();
  const { currentWeather, forecast, loading, error } = useSelector(
    (state: RootState) => state.weather
  );
  const [city, setCity] = React.useState('London');

  const transformWeatherData = (data: WeatherResponse): WeatherData => ({
    temperature: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    condition: data.weather[0].description,
    location: data.name,
  });

  const transformForecastData = (data: ForecastResponse): WeatherData[] =>
    data.list.map((item) => ({
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      condition: item.weather[0].description,
      location: city,
      time: new Date(item.dt * 1000).toLocaleTimeString(),
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
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'text.primary' }}>
          Weather Dashboard
        </Typography>

        <SearchBox component="form" onSubmit={handleSearch}>
          <TextField
            fullWidth
            label="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
              },
            }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </SearchBox>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {currentWeather && (
              <Grid item xs={12} md={4}>
                <WeatherCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                      Current Weather
                    </Typography>
                    <Typography variant="h3" sx={{ mb: 2 }}>
                      {Math.round(currentWeather.temperature)}°C
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                      {currentWeather.location}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {currentWeather.condition}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Humidity: {currentWeather.humidity}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wind Speed: {currentWeather.windSpeed} m/s
                      </Typography>
                    </Box>
                  </CardContent>
                </WeatherCard>
              </Grid>
            )}

            {forecast && forecast.length > 0 && (
              <Grid item xs={12} md={8}>
                <WeatherCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                      Temperature Forecast
                    </Typography>
                    <Box sx={{ height: 300, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecast}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#1976d2"
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
    </Container>
  );
};

export default Weather; 