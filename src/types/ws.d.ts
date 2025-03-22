import { WebSocket } from 'ws';

declare module 'ws' {
  interface WebSocket {
    on(event: 'message', listener: (data: Buffer) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'ping', listener: (data: Buffer) => void): this;
    on(event: 'pong', listener: (data: Buffer) => void): this;
  }
}

declare module 'next/server' {
  interface Request {
    webSocket?: {
      socket: WebSocket;
      response: Response;
    };
  }
} 