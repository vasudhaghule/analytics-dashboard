'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, TextField, CircularProgress, Alert } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { financeService } from '@/services/financeService';
import { RootState } from '@/store/store';
import {
  setSelectedStock,
  setStockData,
  setHistoricalData,
  setLoading,
  setError,
} from '@/store/slices/financeSlice';
import { StockData, HistoricalData, HistoricalDataPoint } from '@/types/finance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Finance() {
  const dispatch = useDispatch();
  const {
    selectedStock,
    stockData,
    historicalData,
    timeRange,
    loading,
    error,
  } = useSelector((state: RootState) => state.finance);

  const [searchInput, setSearchInput] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<Array<{ symbol: string; name: string }>>([]);

  const transformApiHistoricalData = (data: { [date: string]: { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string; } }): HistoricalData => {
    const transformedData: HistoricalData = {};
    
    Object.entries(data).forEach(([date, values]) => {
      transformedData[date] = {
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      };
    });

    return transformedData;
  };

  const fetchStockData = async (symbol: string, retryCount = 0) => {
    if (!symbol || symbol.length < 1) return;
    
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log(`Attempting to fetch data for ${symbol}, attempt ${retryCount + 1}`);
      const data = await financeService.getStockData(symbol);
      
      if (!data) {
        throw new Error('Failed to fetch stock data');
      }
      
      dispatch(setStockData(data));

      // Add delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));

      const historicalResponse = await financeService.getHistoricalData(symbol, timeRange);
      
      if (!historicalResponse || !historicalResponse['Time Series (Daily)']) {
        throw new Error('Failed to fetch historical data');
      }

      const timeSeriesData = historicalResponse['Time Series (Daily)'];
      if (Object.keys(timeSeriesData).length === 0) {
        throw new Error('No historical data available');
      }

      const transformedData = transformApiHistoricalData(timeSeriesData);
      dispatch(setHistoricalData(transformedData));
    } catch (error: any) {
      console.error('Error in fetchStockData:', error);
      
      // If it's a rate limit error and we haven't retried too many times, wait and retry
      if (error.message.includes('rate limit') && retryCount < 2) {
        console.log('Rate limit hit, waiting to retry...');
        dispatch(setError('Rate limit reached. Retrying in 60 seconds...'));
        await new Promise(resolve => setTimeout(resolve, 60000));
        return fetchStockData(symbol, retryCount + 1);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
      dispatch(setError(errorMessage));
      dispatch(setStockData(null));
      dispatch(setHistoricalData(null));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const searchSymbols = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await financeService.searchSymbols(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    // Set a default stock symbol if none is selected
    if (!selectedStock) {
      console.log('No stock selected, setting default to AAPL');
      setSearchInput('AAPL');
      dispatch(setSelectedStock('AAPL'));
    } else {
      console.log('Stock selected:', selectedStock);
      fetchStockData(selectedStock);
    }
  }, [selectedStock, timeRange]);

  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    setSearchInput(value);
    searchSymbols(value);
  };

  const handleSymbolSelect = (symbol: string) => {
    setSearchInput(symbol);
    setSuggestions([]);
    dispatch(setSelectedStock(symbol));
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchInput.length >= 1) {
      handleSymbolSelect(searchInput);
    }
  };

  const transformHistoricalData = () => {
    if (!historicalData) return { labels: [], datasets: [] };

    const dates = Object.keys(historicalData).sort();
    const prices = dates.map(date => historicalData[date].close);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Stock Price',
          data: prices,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };

  const chartData = transformHistoricalData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedStock || ''} Stock Price History`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, position: 'relative' }}>
          <TextField
            label="Stock Symbol"
            value={searchInput}
            onChange={handleSymbolChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            fullWidth
            helperText="Enter a stock symbol (e.g., AAPL, MSFT, GOOGL)"
            error={!!error}
          />
          {suggestions.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 1,
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((suggestion) => (
                <Box
                  key={suggestion.symbol}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleSymbolSelect(suggestion.symbol)}
                >
                  <Typography variant="body2">
                    {suggestion.symbol} - {suggestion.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {stockData && !loading && !error && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {stockData.symbol} - ${stockData.price.toFixed(2)}
            </Typography>
            <Typography color={stockData.change >= 0 ? 'success.main' : 'error.main'}>
              {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
            </Typography>
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              <Typography variant="body2">Open: ${stockData.open.toFixed(2)}</Typography>
              <Typography variant="body2">High: ${stockData.high.toFixed(2)}</Typography>
              <Typography variant="body2">Low: ${stockData.low.toFixed(2)}</Typography>
              <Typography variant="body2">Close: ${stockData.close.toFixed(2)}</Typography>
              <Typography variant="body2">Volume: {stockData.volume.toLocaleString()}</Typography>
            </Box>
          </Box>
        )}

        {historicalData && !loading && !error && (
          <Box sx={{ height: 400 }}>
            <Line options={chartOptions} data={chartData} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 