'use client';

// Socket.IO client for connecting to notifications server
// Server: https://notifications.whencefinancesystem.com

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://notifications.whencefinancesystem.com';

let socket: Socket | null = null;
let listeners: Record<string, Function[]> = {};
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Event type for loan notifications
export interface LoanNotification {
  id?: number;
  loan_number?: string;
  borrower_name?: string;
  amount?: number;
  status?: string;
  created_at?: string;
  office_id?: number;
  type?: string;
  client?: string;
  created_by?: string;
  [key: string]: unknown;
}

export const connectWebSocket = (): void => {
  if (typeof window === 'undefined') return;
  if (socket?.connected) return;

  console.log('🔌 Connecting to Socket.IO server at:', SOCKET_URL);

  try {
    // Connect to the Socket.IO notifications server
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected!', socket?.id);
      isConnected = true;
      reconnectAttempts = 0;
      triggerEvent('connected', { socketId: socket?.id });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      isConnected = false;
      triggerEvent('disconnected', { reason });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        triggerEvent('error', { message: 'Max reconnection attempts reached', error: error.message });
      }
    });

    // Listen for loan.created events from the notifications server
    socket.on('loan.created', (data: LoanNotification) => {
      console.log('💰 loan.created event received:', data);
      triggerEvent('loan.created', data);
    });

    // Listen for notification.created events
    socket.on('notification.created', (data: unknown) => {
      console.log('🔔 notification.created event received:', data);
      triggerEvent('notification.created', data);
    });

    // Also listen for any event (fallback)
    socket.onAny((eventName, ...args) => {
      console.log('📩 Socket.IO event:', eventName, args);
      triggerEvent(eventName, args);
    });

  } catch (error) {
    console.error('Failed to create Socket.IO connection:', error);
  }
};

export const subscribe = (channel: string): void => {
  if (!socket?.connected) {
    console.warn('Socket.IO not connected, cannot subscribe to channel:', channel);
    setTimeout(() => subscribe(channel), 1000);
    return;
  }

  // Socket.IO doesn't require explicit subscription like Pusher
  // The server sends events to all connected clients
  console.log('📡 Channel subscription noted:', channel);
};

export const on = (event: string, callback: Function): void => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
  console.log('✅ Event listener registered:', event, 'Total listeners:', listeners[event].length);
};

export const off = (event: string, callback?: Function): void => {
  if (!listeners[event]) return;
  
  if (callback) {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  } else {
    delete listeners[event];
  }
  console.log('❌ Event listener removed:', event);
};

const triggerEvent = (event: string, data: unknown): void => {
  console.log('🎯 Triggering event:', event, 'with data:', data);
  if (listeners[event]) {
    listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error('Error in event callback:', e);
      }
    });
  }
};

export const getConnectionStatus = (): boolean => isConnected;

export const disconnectWebSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    listeners = {};
    console.log('🔌 Socket.IO disconnected');
  }
};

// Test function
export const testConnection = async (): Promise<void> => {
  console.log('🧪 Testing Socket.IO connection...');
  connectWebSocket();
  
  setTimeout(() => {
    console.log('📡 Connection status:', isConnected);
  }, 3000);
};

if (typeof window !== 'undefined') {
  (window as any).testWebSocketConnection = testConnection;
}

export default {
  connect: connectWebSocket,
  subscribe,
  on,
  off,
  disconnect: disconnectWebSocket,
  getStatus: getConnectionStatus,
  test: testConnection,
};
