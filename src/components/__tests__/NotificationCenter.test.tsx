import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import NotificationCenter from '../NotificationCenter';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock the realtime updates hook
jest.mock('@/hooks/useRealtimeUpdates', () => ({
  useRealtimeUpdates: jest.fn(),
}));

describe('NotificationCenter', () => {
  const mockT = jest.fn((key) => key);
  const mockUpdates = [
    {
      id: '1',
      type: 'stock_update',
      message: 'AAPL price updated',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'news_alert',
      message: 'Breaking news',
      timestamp: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: mockUpdates,
      clearUpdates: jest.fn(),
      isConnected: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification center with updates', () => {
    render(<NotificationCenter />);
    
    expect(screen.getByText('notifications.title')).toBeInTheDocument();
    expect(screen.getByText('AAPL price updated')).toBeInTheDocument();
    expect(screen.getByText('Breaking news')).toBeInTheDocument();
    expect(screen.getByText('notifications.clearAll')).toBeInTheDocument();
  });

  it('renders empty state when no updates', () => {
    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: [],
      clearUpdates: jest.fn(),
      isConnected: true,
    });

    render(<NotificationCenter />);
    
    expect(screen.getByText('notifications.noUpdates')).toBeInTheDocument();
  });

  it('calls clearUpdates when clear button is clicked', async () => {
    const mockClearUpdates = jest.fn();
    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: mockUpdates,
      clearUpdates: mockClearUpdates,
      isConnected: true,
    });

    render(<NotificationCenter />);
    
    const clearButton = screen.getByText('notifications.clearAll');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockClearUpdates).toHaveBeenCalled();
    });
  });

  it('displays connection status', () => {
    (useRealtimeUpdates as jest.Mock).mockReturnValue({
      updates: [],
      clearUpdates: jest.fn(),
      isConnected: false,
    });

    render(<NotificationCenter />);
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('applies correct styles based on notification type', () => {
    render(<NotificationCenter />);
    
    const stockUpdate = screen.getByText('AAPL price updated').closest('div');
    const newsAlert = screen.getByText('Breaking news').closest('div');

    expect(stockUpdate).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
    expect(newsAlert).toHaveClass('bg-purple-50', 'dark:bg-purple-900/20');
  });
}); 