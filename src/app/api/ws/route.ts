import { WebSocketServer, WebSocket } from 'ws';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { IncomingMessage } from 'http';

const prisma = new PrismaClient();
const wss = new WebSocketServer({ noServer: true });

interface WebSocketClient extends WebSocket {
  userId?: string;
  channels?: string[];
}

const clients = new Map<string, WebSocketClient>();

wss.on('connection', (ws: WebSocketClient) => {
  console.log('Client connected');

  ws.on('message', async (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe') {
        ws.channels = data.channels;
        console.log(`Client ${ws.userId} subscribed to:`, ws.channels);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log('Client disconnected:', ws.userId);
    }
  });
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { socket, response } = (request as any).webSocket;

  const client = socket as WebSocketClient;
  client.userId = session.user.id;
  clients.set(session.user.id, client);

  // Create a mock IncomingMessage object with all required properties
  const mockIncomingMessage = {
    headers: request.headers,
    method: request.method,
    url: request.url,
    socket: socket,
    aborted: false,
    httpVersion: '1.1',
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    complete: false,
    connection: socket,
    rawHeaders: [],
    rawTrailers: [],
    trailers: {},
    statusCode: 101,
    statusMessage: 'Switching Protocols',
    headersDistinct: {},
    trailersDistinct: {},
    setTimeout: () => {},
    destroy: () => {},
    read: () => {},
    pause: () => {},
    resume: () => {},
    pipe: () => {},
    unpipe: () => {},
    wrap: () => {},
    push: () => {},
    unshift: () => {},
    addListener: () => {},
    emit: () => false,
    on: () => {},
    once: () => {},
    prependListener: () => {},
    prependOnceListener: () => {},
    removeListener: () => {},
    off: () => {},
    removeAllListeners: () => {},
    setMaxListeners: () => {},
    getMaxListeners: () => 0,
    listeners: () => [],
    rawListeners: () => [],
    listenerCount: () => 0,
    eventNames: () => [],
  } as unknown as IncomingMessage;

  wss.handleUpgrade(mockIncomingMessage, socket, Buffer.alloc(0), (ws: WebSocketClient) => {
    wss.emit('connection', ws);
  });

  return response;
}

// Helper function to broadcast updates to subscribed clients
export async function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data });

  Array.from(clients.entries()).forEach(([userId, client]) => {
    if (client.channels?.includes(type) && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Example: Broadcast stock updates
export async function broadcastStockUpdate(symbol: string, data: any) {
  await broadcastUpdate('stock_update', { symbol, ...data });
}

// Example: Broadcast news alerts
export async function broadcastNewsAlert(data: any) {
  await broadcastUpdate('news_alert', data);
}

// Example: Broadcast weather updates
export async function broadcastWeatherUpdate(location: string, data: any) {
  await broadcastUpdate('weather_update', { location, ...data });
}

// Example: Broadcast notifications
export async function broadcastNotification(userId: string, data: any) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'notification', data }));
  }
} 