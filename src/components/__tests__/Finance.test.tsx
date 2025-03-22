import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Finance from '../Finance';
import financeReducer, {
  setSelectedStock,
  setStockData,
  setHistoricalData,
  setLoading,
  setError,
} from '@/store/slices/financeSlice';
import { StockData, HistoricalData, HistoricalDataPoint } from '@/types/finance';
import { financeService } from '@/services/financeService';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

// Mock the finance service
jest.mock('@/services/financeService', () => ({
  financeService: {
    getStockData: jest.fn(),
    getHistoricalData: jest.fn(),
  },
}));

// Mock the realtime updates hook
jest.mock('@/hooks/useRealtimeUpdates', () => ({
  useRealtimeUpdates: jest.fn(),
}));

describe('Finance', () => {
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
    } as HistoricalDataPoint,
    '2024-01-02': {
      open: 150.00,
      high: 152.00,
      low: 149.00,
      close: 151.50,
      volume: 1100000,
    } as HistoricalDataPoint,
  };

  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        finance: financeReducer,
      },
    });

    (financeService.getStockData as jest.Mock).mockResolvedValue(mockStockData);
    (financeService.getHistoricalData as jest.Mock).mockResolvedValue({
      'Time Series (Daily)': mockHistoricalData,
    });

    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: [],
      isConnected: true,
      clearUpdates: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders stock data after successful fetch', async () => {
    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('AAPL - $150.00')).toBeInTheDocument();
      expect(screen.getByText('+2.50 (1.67%)')).toBeInTheDocument();
      expect(screen.getByText('Open: $148.00')).toBeInTheDocument();
      expect(screen.getByText('High: $151.00')).toBeInTheDocument();
      expect(screen.getByText('Low: $147.50')).toBeInTheDocument();
      expect(screen.getByText('Close: $150.00')).toBeInTheDocument();
      expect(screen.getByText('Volume: 1,000,000')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    const errorMessage = 'Failed to fetch stock data';
    (financeService.getStockData as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('updates stock data when symbol changes', async () => {
    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    const input = screen.getByLabelText('Stock Symbol');
    fireEvent.change(input, { target: { value: 'MSFT' } });

    await waitFor(() => {
      expect(financeService.getStockData).toHaveBeenCalledWith('MSFT');
      expect(financeService.getHistoricalData).toHaveBeenCalledWith('MSFT', '1d');
    });
  });

  it('updates chart when time range changes', async () => {
    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('AAPL Stock Price History')).toBeInTheDocument();
    });

    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.change(timeRangeSelect, { target: { value: '1m' } });

    await waitFor(() => {
      expect(financeService.getHistoricalData).toHaveBeenCalledWith('AAPL', '1m');
    });
  });

  it('handles real-time stock updates', async () => {
    const realtimeUpdate = {
      type: 'stock_update',
      data: {
        symbol: 'AAPL',
        price: 152.00,
        change: 4.50,
        changePercent: 3.05,
      },
    };

    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: [realtimeUpdate],
      isConnected: true,
      clearUpdates: jest.fn(),
    });

    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('AAPL - $152.00')).toBeInTheDocument();
      expect(screen.getByText('+4.50 (3.05%)')).toBeInTheDocument();
    });
  });

  it('shows connection status for real-time updates', () => {
    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: [],
      isConnected: false,
      clearUpdates: jest.fn(),
    });

    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('clears updates when component unmounts', () => {
    const clearUpdates = jest.fn();
    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: [],
      isConnected: true,
      clearUpdates,
    });

    const { unmount } = render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    unmount();
    expect(clearUpdates).toHaveBeenCalled();
  });

  it('handles empty historical data', async () => {
    (financeService.getHistoricalData as jest.Mock).mockResolvedValue({
      'Time Series (Daily)': {},
    });

    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No historical data available')).toBeInTheDocument();
    });
  });

  it('displays correct color for positive and negative changes', async () => {
    const positiveStockData = { ...mockStockData };
    const negativeStockData = {
      ...mockStockData,
      change: -2.50,
      changePercent: -1.67,
    };

    // Test positive change
    (financeService.getStockData as jest.Mock).mockResolvedValue(positiveStockData);
    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      const positiveChange = screen.getByText('+2.50 (1.67%)');
      expect(positiveChange).toHaveStyle({ color: 'success.main' });
    });

    // Cleanup and test negative change
    jest.clearAllMocks();
    (financeService.getStockData as jest.Mock).mockResolvedValue(negativeStockData);
    render(
      <Provider store={store}>
        <Finance />
      </Provider>
    );

    await waitFor(() => {
      const negativeChange = screen.getByText('-2.50 (-1.67%)');
      expect(negativeChange).toHaveStyle({ color: 'error.main' });
    });
  });
}); 