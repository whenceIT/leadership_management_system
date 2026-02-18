'use client';

import { useEffect, useState, useCallback } from 'react';
import websocket, { connectWebSocket, subscribe, on, off, getConnectionStatus } from '@/lib/websocket';
import PriorityActionService from '@/services/PriorityActionService';

export interface LoanData {
  id?: number;
  loan_number?: string;
  borrower_name?: string;
  client?: string; // Alternative field name for borrower
  amount?: number | string; // Can be number or string
  amount_formatted?: string;
  status?: string;
  type?: string; // Loan type (New Loan, Top-up, part_payment, etc.)
  created_by?: string;
  office_id?: number;
  created_at?: string;
  updated_at?: string;
  // Nested loan object from WebSocket event
  loan?: {
    id?: number;
    principal?: string | number;
    applied_amount?: string | number;
    approved_amount?: string | number;
    status?: string;
    loan_product_id?: number;
    loan_product?: {
      id?: number;
      name?: string;
      short_name?: string;
    };
    office_id?: number;
    client_id?: number;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
  // Nested transaction object from WebSocket event
  transaction?: {
    id?: number;
    loan_id?: number;
    transaction_type?: string;
    credit?: string | number;
    date?: string;
    created_at?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UseLoanUpdatesReturn {
  latestLoan: LoanData | null;
  loans: LoanData[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export interface UseLoanUpdatesWithHistoryReturn {
  latestLoan: LoanData | null;
  loanHistory: LoanData[];
  isConnected: boolean;
  error: string | null;
  clearHistory: () => void;
  reconnect: () => void;
}

export const useLoanUpdatesWithHistory = (
  maxHistory: number = 10,
  onNewLoan?: (loan: LoanData) => void
): UseLoanUpdatesWithHistoryReturn => {
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loanHistory, setLoanHistory] = useState<LoanData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get PriorityActionService instance
  const priorityActionService = PriorityActionService.getInstance();

  const handleLoanCreated = useCallback((data: LoanData) => {
    // console.log('💰 New loan created:', data);
    setLatestLoan(data);
    setLoanHistory(prev => {
      const updated = [data, ...prev];
      // Keep only maxHistory items
      return updated.slice(0, maxHistory);
    });

    // Process new loan through PriorityActionService
    // const priorityResult = priorityActionService.processNewLoan(data);
    // console.log('📋 Priority actions updated:', priorityResult.newActionsAdded, 'new actions');

    if (onNewLoan) {
      onNewLoan(data);
    }
  }, [maxHistory, onNewLoan, priorityActionService]);

  const handleConnected = useCallback(() => {
    console.log('🔗 WebSocket connected, subscribing to loans channel...');
    setIsConnected(true);
    setError(null);
    
    // Subscribe to the loans channel
    subscribe('loans');
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('🔌 WebSocket disconnected');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Register event listeners
    on('connected', handleConnected);
    on('disconnected', handleDisconnected);
    on('loan.created', handleLoanCreated);
    on('loans.loan.created', handleLoanCreated);
    on('pusher:subscription_succeeded', (data: unknown) => {
      console.log('📡 Subscription succeeded:', data);
    });
    on('pusher:subscription_error', (data: unknown) => {
      console.error('📡 Subscription error:', data);
      setError('Failed to subscribe to loans channel');
    });

    // Connect to WebSocket
    console.log('🚀 Initializing loan updates with history...');
    connectWebSocket();

    // Cleanup
    return () => {
      off('connected', handleConnected);
      off('disconnected', handleDisconnected);
      off('loan.created', handleLoanCreated);
      off('loans.loan.created', handleLoanCreated);
    };
  }, [handleConnected, handleDisconnected, handleLoanCreated]);

  const clearHistory = useCallback(() => {
    setLoanHistory([]);
    setLatestLoan(null);
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting...');
    setError(null);
    connectWebSocket();
  }, []);

  return {
    latestLoan,
    loanHistory,
    isConnected,
    error,
    clearHistory,
    reconnect,
  };
};

export const useLoanUpdates = (): UseLoanUpdatesReturn => {
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get PriorityActionService instance
  const priorityActionService = PriorityActionService.getInstance();

  const handleLoanCreated = useCallback((data: LoanData) => {
    // console.log('💰 New loan created:', data);
    setLatestLoan(data);
    setLoans(prev => [data, ...prev]);

    // Process new loan through PriorityActionService
    const priorityResult = priorityActionService.processNewLoan(data);
    console.log('📋 Priority actions updated:', priorityResult.newActionsAdded, 'new actions');
  }, [priorityActionService]);

  const handleConnected = useCallback(() => {
    console.log('🔗 WebSocket connected, subscribing to loans channel...');
    setIsConnected(true);
    setError(null);
    
    // Subscribe to the loans channel
    subscribe('loans');
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('🔌 WebSocket disconnected');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Register event listeners
    on('connected', handleConnected);
    on('disconnected', handleDisconnected);
    on('loan.created', handleLoanCreated);
    on('loans.loan.created', handleLoanCreated);
    on('pusher:subscription_succeeded', (data: unknown) => {
      console.log('📡 Subscription succeeded:', data);
    });
    on('pusher:subscription_error', (data: unknown) => {
      console.error('📡 Subscription error:', data);
      setError('Failed to subscribe to loans channel');
    });

    // Connect to WebSocket
    console.log('🚀 Initializing loan updates...');
    connectWebSocket();

    // Cleanup
    return () => {
      off('connected', handleConnected);
      off('disconnected', handleDisconnected);
      off('loan.created', handleLoanCreated);
      off('loans.loan.created', handleLoanCreated);
    };
  }, [handleConnected, handleDisconnected, handleLoanCreated]);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting...');
    setError(null);
    connectWebSocket();
  }, []);

  return {
    latestLoan,
    loans,
    isConnected,
    error,
    reconnect,
  };
};

export default useLoanUpdates;
