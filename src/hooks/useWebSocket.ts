import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface WebSocketMessage {
  type: 'stock_update' | 'news_alert' | 'weather_update' | 'notification';
  data: any;
}

export const useWebSocket = () => {
  const { data: session } = useSession();
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!session?.user) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${session.user.id}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to relevant channels
      ws.current?.send(JSON.stringify({
        type: 'subscribe',
        channels: ['stocks', 'news', 'weather', 'notifications'],
      }));
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [session]);

  useEffect(() => {
    connect();

    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const messageHandler = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      if (message.type === channel) {
        callback(message.data);
      }
    };

    ws.current.addEventListener('message', messageHandler);

    return () => {
      ws.current?.removeEventListener('message', messageHandler);
    };
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    ws.current.send(JSON.stringify({ type, data }));
  }, []);

  return {
    subscribe,
    sendMessage,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
}; 