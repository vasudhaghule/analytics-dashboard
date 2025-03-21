import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { financeService } from '../services/financeService';
import {
  setSelectedStock,
  addToWatchlist,
  removeFromWatchlist,
  setHistoricalData,
  setLoading,
  setError,
  setTimeRange,
} from '../store/slices/financeSlice';
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
import DeleteIcon from '@mui/icons-material/Delete';

const StockCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const Finance: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedStock, watchlist, historicalData, loading, error, timeRange } = useSelector(
    (state: RootState) => state.finance
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);

  const fetchStockData = async (symbol: string) => {
    try {
      dispatch(setLoading(true));
      const [stockData, historical] = await Promise.all([
        financeService.getStockData(symbol),
        financeService.getHistoricalData(symbol, timeRange),
      ]);

      dispatch(setSelectedStock(stockData));
      dispatch(setHistoricalData({ symbol, data: historical['Time Series (Daily)'] }));
      dispatch(setError(null));
    } catch (err) {
      dispatch(setError('Failed to fetch stock data'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const results = await financeService.searchSymbols(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search symbols:', err);
    }
  };

  const handleSymbolSelect = (symbol: string) => {
    fetchStockData(symbol);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddToWatchlist = () => {
    if (selectedStock) {
      dispatch(addToWatchlist(selectedStock));
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    dispatch(removeFromWatchlist(symbol));
  };

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: '1d' | '1w' | '1m' | '1y' | null
  ) => {
    if (newTimeRange !== null) {
      dispatch(setTimeRange(newTimeRange));
      if (selectedStock) {
        fetchStockData(selectedStock.symbol);
      }
    }
  };

  const formatChartData = () => {
    if (!selectedStock || !historicalData[selectedStock.symbol]) return [];

    return Object.entries(historicalData[selectedStock.symbol])
      .map(([date, data]) => ({
        date,
        price: parseFloat(data['4. close']),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Finance Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Search stock symbol"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {searchResults.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <List>
                  {searchResults.map((result) => (
                    <ListItem
                      button
                      key={result.symbol}
                      onClick={() => handleSymbolSelect(result.symbol)}
                    >
                      <ListItemText
                        primary={result.symbol}
                        secondary={result.name}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}
          </Box>

          {selectedStock && (
            <StockCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedStock.symbol}
                </Typography>
                <Typography variant="h3" color={selectedStock.change >= 0 ? 'success.main' : 'error.main'}>
                  ${selectedStock.price.toFixed(2)}
                </Typography>
                <Typography variant="h6" color={selectedStock.change >= 0 ? 'success.main' : 'error.main'}>
                  {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <ToggleButtonGroup
                    value={timeRange}
                    exclusive
                    onChange={handleTimeRangeChange}
                    aria-label="time range"
                  >
                    <ToggleButton value="1d">1D</ToggleButton>
                    <ToggleButton value="1w">1W</ToggleButton>
                    <ToggleButton value="1m">1M</ToggleButton>
                    <ToggleButton value="1y">1Y</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box sx={{ height: 400, mt: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8884d8"
                        name="Price ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StockCard>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <StockCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Watchlist
              </Typography>
              <List>
                {watchlist.map((stock) => (
                  <ListItem key={stock.symbol}>
                    <ListItemText
                      primary={stock.symbol}
                      secondary={`$${stock.price.toFixed(2)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {selectedStock && !watchlist.find(s => s.symbol === selectedStock.symbol) && (
                <Button
                  variant="contained"
                  onClick={handleAddToWatchlist}
                  fullWidth
                >
                  Add to Watchlist
                </Button>
              )}
            </CardContent>
          </StockCard>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default Finance; 