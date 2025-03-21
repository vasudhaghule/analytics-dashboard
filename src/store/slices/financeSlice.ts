import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface FinanceState {
  selectedStock: StockData | null;
  watchlist: StockData[];
  historicalData: {
    [symbol: string]: {
      [date: string]: StockData;
    };
  };
  loading: boolean;
  error: string | null;
  timeRange: '1d' | '1w' | '1m' | '1y';
}

const initialState: FinanceState = {
  selectedStock: null,
  watchlist: [],
  historicalData: {},
  loading: false,
  error: null,
  timeRange: '1d',
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setSelectedStock: (state, action: PayloadAction<StockData | null>) => {
      state.selectedStock = action.payload;
    },
    addToWatchlist: (state, action: PayloadAction<StockData>) => {
      if (!state.watchlist.find(stock => stock.symbol === action.payload.symbol)) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(stock => stock.symbol !== action.payload);
    },
    setHistoricalData: (state, action: PayloadAction<{ symbol: string; data: { [date: string]: StockData } }>) => {
      state.historicalData[action.payload.symbol] = action.payload.data;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<'1d' | '1w' | '1m' | '1y'>) => {
      state.timeRange = action.payload;
    },
  },
});

export const {
  setSelectedStock,
  addToWatchlist,
  removeFromWatchlist,
  setHistoricalData,
  setLoading,
  setError,
  setTimeRange,
} = financeSlice.actions;
export default financeSlice.reducer; 