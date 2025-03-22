import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockData, HistoricalData, TimeRange } from '@/types/finance';

interface FinanceState {
  selectedStock: string | null;
  stockData: StockData | null;
  historicalData: HistoricalData | null;
  timeRange: TimeRange;
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  selectedStock: null,
  stockData: null,
  historicalData: null,
  timeRange: '1d',
  loading: false,
  error: null,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setSelectedStock: (state, action: PayloadAction<string | null>) => {
      state.selectedStock = action.payload;
    },
    setStockData: (state, action: PayloadAction<StockData | null>) => {
      state.stockData = action.payload;
    },
    setHistoricalData: (state, action: PayloadAction<HistoricalData | null>) => {
      state.historicalData = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.timeRange = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSelectedStock,
  setStockData,
  setHistoricalData,
  setTimeRange,
  setLoading,
  setError,
} = financeSlice.actions;

export default financeSlice.reducer; 