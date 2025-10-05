import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  gameId?: string;
  payload?: any;
}

interface UseWebSocketOptions {
  url: string;
  gameId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

export const useWebSocket = ({
  url,
  gameId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  enabled = true
}: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 連接已建立');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // 加入遊戲房間
        ws.send(JSON.stringify({
          type: 'JOIN_GAME',
          gameId
        }));
        
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('解析 WebSocket 消息錯誤:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket 連接已關閉:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();

        // 自動重連
        if (enabled && shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`嘗試重連 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 錯誤:', error);
        setConnectionStatus('error');
        onError?.(error);
      };

    } catch (error) {
      console.error('創建 WebSocket 連接失敗:', error);
      setConnectionStatus('error');
    }
  }, [url, gameId, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts, enabled]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'gameId'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        gameId
      }));
      return true;
    }
    console.warn('WebSocket 未連接，無法發送消息');
    return false;
  }, [gameId]);

  const joinGame = useCallback(() => {
    sendMessage({ type: 'JOIN_GAME' });
  }, [sendMessage]);

  const updateGameState = useCallback((gameState: any) => {
    sendMessage({
      type: 'UPDATE_GAME_STATE',
      payload: gameState
    });
  }, [sendMessage]);

  const sendPlayerAction = useCallback((action: any) => {
    sendMessage({
      type: 'PLAYER_ACTION',
      payload: action
    });
  }, [sendMessage]);

  const sendExpenseAction = useCallback((action: any) => {
    sendMessage({
      type: 'EXPENSE_ACTION',
      payload: action
    });
  }, [sendMessage]);

  const requestSync = useCallback(() => {
    sendMessage({ type: 'SYNC_REQUEST' });
  }, [sendMessage]);

  useEffect(() => {
    if (!enabled) return;
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled]);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    joinGame,
    updateGameState,
    sendPlayerAction,
    sendExpenseAction,
    requestSync
  };
};


