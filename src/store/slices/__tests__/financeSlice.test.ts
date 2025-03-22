import financeReducer, {
  setSelectedStock,
  setStockData,
  setHistoricalData,
  setTimeRange,
  setLoading,
  setError,
} from '../financeSlice';
import { StockData, HistoricalData, TimeRange } from '@/types/finance';
import { PayloadAction } from '@reduxjs/toolkit';

describe('financeSlice', () => {
  const mockStockData: StockData = {
    symbol: 'AAPL',
    price: 150.00,
    change: 2.50,
    changePercent: 1.67,
    open: 148.00,
    high: 151.00,
    low: 147.50,
    close: 150.00,
    volume: 1000000,
    marketCap: 2500000000000,
    peRatio: 25.5,
  };

  const mockHistoricalData: HistoricalData = {
    '2024-01-01': {
      open: 148.00,
      high: 151.00,
      low: 147.50,
      close: 150.00,
      volume: 1000000,
    },
    '2024-01-02': {
      open: 150.00,
      high: 152.00,
      low: 149.00,
      close: 151.50,
      volume: 1100000,
    },
  };

  it('should return the initial state', () => {
    expect(financeReducer(undefined, { type: '@@INIT' } as PayloadAction<void>)).toEqual({
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d',
      loading: false,
      error: null,
    });
  });

  it('should handle setSelectedStock', () => {
    const initialState = {
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    expect(
      financeReducer(initialState, setSelectedStock('MSFT'))
    ).toEqual({
      ...initialState,
      selectedStock: 'MSFT',
    });
  });

  it('should handle setStockData', () => {
    const initialState = {
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    expect(
      financeReducer(initialState, setStockData(mockStockData))
    ).toEqual({
      ...initialState,
      stockData: mockStockData,
    });
  });

  it('should handle setHistoricalData', () => {
    const initialState = {
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    expect(
      financeReducer(initialState, setHistoricalData(mockHistoricalData))
    ).toEqual({
      ...initialState,
      historicalData: mockHistoricalData,
    });
  });

  it('should handle setTimeRange', () => {
    const initialState = {
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    expect(
      financeReducer(initialState, setTimeRange('1m'))
    ).toEqual({
      ...initialState,
      timeRange: '1m',
    });
  });

  it('should handle setLoading', () => {
    const initialState = {
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    expect(
      financeReducer(initialState, setLoading(true))
    ).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('should handle setError', () => {
    const initialState = {
      selectedStock: 'AAPL',
      stockData: null,
      historicalData: null,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    const errorMessage = 'Failed to fetch stock data';
    expect(
      financeReducer(initialState, setError(errorMessage))
    ).toEqual({
      ...initialState,
      error: errorMessage,
    });
  });

  it('should handle multiple actions in sequence', () => {
    let state = financeReducer(undefined, { type: '@@INIT' } as PayloadAction<void>);

    // Set loading to true
    state = financeReducer(state, setLoading(true));
    expect(state.loading).toBe(true);

    // Set stock data
    state = financeReducer(state, setStockData(mockStockData));
    expect(state.stockData).toEqual(mockStockData);

    // Set historical data
    state = financeReducer(state, setHistoricalData(mockHistoricalData));
    expect(state.historicalData).toEqual(mockHistoricalData);

    // Set loading to false
    state = financeReducer(state, setLoading(false));
    expect(state.loading).toBe(false);
  });

  it('should preserve other state when updating one property', () => {
    const state = {
      selectedStock: 'AAPL',
      stockData: mockStockData,
      historicalData: mockHistoricalData,
      timeRange: '1d' as TimeRange,
      loading: false,
      error: null,
    };

    const newState = financeReducer(state, setSelectedStock('MSFT'));
    expect(newState).toEqual({
      ...state,
      selectedStock: 'MSFT',
    });
    expect(newState.stockData).toBe(state.stockData);
    expect(newState.historicalData).toBe(state.historicalData);
  });

  it('should handle error state transitions', () => {
    let state = financeReducer(undefined, { type: '@@INIT' } as PayloadAction<void>);

    // Set error
    state = financeReducer(state, setError('API Error'));
    expect(state.error).toBe('API Error');

    // Clear error
    state = financeReducer(state, setError(null));
    expect(state.error).toBeNull();

    // Error should be cleared when setting new data
    state = financeReducer(state, setError('API Error'));
    state = financeReducer(state, setStockData(mockStockData));
    expect(state.error).toBeNull();
    expect(state.stockData).toEqual(mockStockData);
  });
}); 