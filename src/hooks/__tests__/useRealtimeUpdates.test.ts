import { renderHook, act } from '@testing-library/react';
import { useRealtimeUpdates } from '../useRealtimeUpdates';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

interface MockWebSocketInstance {
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
  onopen: ((ev: Event) => void) | null;
  onclose: ((ev: CloseEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onmessage: ((ev: MessageEvent) => void) | null;
  send: jest.Mock;
  close: jest.Mock;
  readyState: number;
}

interface MockWebSocketConstructor {
  new (url: string): MockWebSocketInstance;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

// Create mock WebSocket constructor
const mockWebSocket: MockWebSocketInstance = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  onopen: null,
  onclose: null,
  onerror: null,
  onmessage: null,
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
};

const MockWebSocketClass = jest.fn(() => mockWebSocket) as unknown as MockWebSocketConstructor;
MockWebSocketClass.CONNECTING = 0;
MockWebSocketClass.OPEN = 1;
MockWebSocketClass.CLOSING = 2;
MockWebSocketClass.CLOSED = 3;

// Mock the global WebSocket
global.WebSocket = MockWebSocketClass as unknown as typeof WebSocket;

describe('useRealtimeUpdates', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated',
    });
    mockWebSocket.readyState = MockWebSocketClass.OPEN;
    jest.clearAllMocks();
  });

  it('should handle connection errors', () => {
    const { result } = renderHook(() => useRealtimeUpdates(['stock_update']));

    // Simulate connection error
    act(() => {
      mockWebSocket.readyState = MockWebSocketClass.CLOSED;
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should handle message parsing errors', () => {
    const { result } = renderHook(() => useRealtimeUpdates(['stock_update']));

    // Simulate invalid message
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(new MessageEvent('message', {
          data: 'invalid json',
        }));
      }
    });

    expect(result.current.updates).toHaveLength(0);
  });

  it('should handle reconnection on connection close', () => {
    const { result } = renderHook(() => useRealtimeUpdates(['stock_update']));

    // Simulate connection close
    act(() => {
      mockWebSocket.readyState = MockWebSocketClass.CLOSED;
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
    });

    expect(result.current.isConnected).toBe(false);
    expect(MockWebSocketClass).toHaveBeenCalledTimes(2);
  });

  it('should handle subscription messages', () => {
    const { result } = renderHook(() => useRealtimeUpdates(['stock_update']));

    // Simulate successful connection
    act(() => {
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'subscribe',
        channels: ['stock_update'],
      })
    );
  });

  it('should handle successful message updates', () => {
    const { result } = renderHook(() => useRealtimeUpdates(['stock_update']));

    // Simulate successful message
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'stock_update',
            data: { symbol: 'AAPL', price: 150 },
          }),
        }));
      }
    });

    expect(result.current.updates).toHaveLength(1);
    expect(result.current.updates[0]).toEqual({
      type: 'stock_update',
      data: { symbol: 'AAPL', price: 150 },
    });
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeUpdates(['stock_update']));

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle multiple channels', () => {
    const { result } = renderHook(() => 
      useRealtimeUpdates(['stock_update', 'news_alert', 'weather_update'])
    );

    // Simulate successful connection
    act(() => {
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'subscribe',
        channels: ['stock_update', 'news_alert', 'weather_update'],
      })
    );
  });

  it('should clear updates when clearUpdates is called', () => {
    const { result } = renderHook(() => useRealtimeUpdates(['stock_update']));

    // Add an update
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'stock_update',
            data: { symbol: 'AAPL', price: 150 },
          }),
        }));
      }
    });

    expect(result.current.updates).toHaveLength(1);

    // Clear updates
    act(() => {
      result.current.clearUpdates();
    });

    expect(result.current.updates).toHaveLength(0);
  });
}); 