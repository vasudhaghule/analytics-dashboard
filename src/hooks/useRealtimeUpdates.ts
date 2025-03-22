import { useEffect, useCallback, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface RealtimeUpdate {
  type: 'stock_update' | 'news_alert' | 'weather_update' | 'notification';
  data: any;
}

export const useRealtimeUpdates = (channels: string[]) => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!session?.user) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${session.user.id}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Subscribe to channels
      ws.current?.send(JSON.stringify({
        type: 'subscribe',
        channels,
      }));
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setUpdates((prev) => [...prev, update]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [session, channels]);

  useEffect(() => {
    connect();

    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    isConnected,
    updates,
    clearUpdates,
  };
}; 