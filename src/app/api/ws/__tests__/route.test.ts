import { WebSocketServer, WebSocket } from 'ws';
import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock WebSocket server
jest.mock('ws', () => ({
  WebSocketServer: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    clients: new Set<WebSocket>(),
  })),
  WebSocket: jest.fn(),
}));

describe('WebSocket Server', () => {
  let mockWebSocketServer: jest.Mocked<WebSocketServer>;
  let mockRequest: NextRequest;
  let mockClient: jest.Mocked<WebSocket>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock WebSocket client
    mockClient = {
      send: jest.fn(),
      readyState: 1,
      binaryType: 'nodebuffer',
      bufferedAmount: 0,
      extensions: '',
      protocol: '',
      url: '',
      isPaused: false,
      ping: jest.fn(),
      pong: jest.fn(),
      terminate: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as jest.Mocked<WebSocket>;

    // Create mock WebSocket server
    mockWebSocketServer = new WebSocketServer({ noServer: true }) as jest.Mocked<WebSocketServer>;

    // Create mock request
    mockRequest = new NextRequest('http://localhost:3000/api/ws', {
      method: 'GET',
      headers: new Headers({
        'upgrade': 'websocket',
      }),
    });
  });

  it('handles WebSocket upgrade request', async () => {
    const response = await GET(mockRequest);

    expect(response.status).toBe(101);
    expect(WebSocketServer).toHaveBeenCalledWith({ noServer: true });
  });

  it('handles client connection', async () => {
    // Simulate client connection
    const connectionHandler = mockWebSocketServer.on.mock.calls.find(
      call => call[0] === 'connection'
    )?.[1];
    if (connectionHandler) {
      connectionHandler.call(mockWebSocketServer, mockClient);
    }

    // Verify client is added to clients set
    expect(mockWebSocketServer.clients.has(mockClient)).toBe(true);

    // Simulate client message
    const messageHandler = mockWebSocketServer.on.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];
    if (messageHandler) {
      const message = Buffer.from(JSON.stringify({
        type: 'stock_update',
        message: 'AAPL price updated',
        timestamp: new Date().toISOString(),
      }));
      messageHandler.call(mockWebSocketServer, message, mockClient);
    }

    // Verify message is broadcast to all clients
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('handles client disconnection', async () => {
    // Simulate client connection
    const connectionHandler = mockWebSocketServer.on.mock.calls.find(
      call => call[0] === 'connection'
    )?.[1];
    if (connectionHandler) {
      connectionHandler.call(mockWebSocketServer, mockClient);
    }

    // Verify client is added to clients set
    expect(mockWebSocketServer.clients.has(mockClient)).toBe(true);

    // Simulate client disconnection
    const closeHandler = mockWebSocketServer.on.mock.calls.find(
      call => call[0] === 'close'
    )?.[1];
    if (closeHandler) {
      closeHandler.call(mockWebSocketServer);
    }

    // Verify client is removed from clients set
    expect(mockWebSocketServer.clients.has(mockClient)).toBe(false);
  });

  it('broadcasts messages to all connected clients', async () => {
    const mockClient2 = {
      ...mockClient,
      send: jest.fn(),
    };

    // Simulate multiple client connections
    const connectionHandler = mockWebSocketServer.on.mock.calls.find(
      call => call[0] === 'connection'
    )?.[1];
    if (connectionHandler) {
      connectionHandler.call(mockWebSocketServer, mockClient);
      connectionHandler.call(mockWebSocketServer, mockClient2);
    }

    // Simulate message broadcast
    const messageHandler = mockWebSocketServer.on.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];
    if (messageHandler) {
      const message = Buffer.from(JSON.stringify({
        type: 'stock_update',
        message: 'AAPL price updated',
        timestamp: new Date().toISOString(),
      }));
      messageHandler.call(mockWebSocketServer, message, mockClient);
    }

    // Verify message is broadcast to all clients
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(Buffer));
    expect(mockClient2.send).toHaveBeenCalledWith(expect.any(Buffer));
  });
}); 