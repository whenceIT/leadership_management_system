'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLoanUpdatesWithHistory, LoanData } from '@/hooks/useLoanUpdates';

interface LoanWebSocketContextValue {
  latestLoan: LoanData | null;
  loanHistory: LoanData[];
  isConnected: boolean;
  error: string | null;
  clearHistory: () => void;
  totalLoansReceived: number;
}

const LoanWebSocketContext = createContext<LoanWebSocketContextValue | undefined>(undefined);

interface LoanWebSocketProviderProps {
  children: React.ReactNode;
  maxHistory?: number;
  onNewLoan?: (loan: LoanData) => void;
}

export const LoanWebSocketProvider: React.FC<LoanWebSocketProviderProps> = ({
  children,
  maxHistory = 10,
  onNewLoan,
}) => {
  const [totalLoansReceived, setTotalLoansReceived] = useState(0);

  const handleNewLoan = useCallback((loan: LoanData) => {
    setTotalLoansReceived((prev) => prev + 1);
    if (onNewLoan) {
      onNewLoan(loan);
    }
  }, [onNewLoan]);

  const { latestLoan, loanHistory, isConnected, error, clearHistory } = useLoanUpdatesWithHistory(
    maxHistory,
    handleNewLoan
  );

  const value: LoanWebSocketContextValue = {
    latestLoan,
    loanHistory,
    isConnected,
    error,
    clearHistory,
    totalLoansReceived,
  };

  return (
    <LoanWebSocketContext.Provider value={value}>
      {children}
    </LoanWebSocketContext.Provider>
  );
};

export const useLoanWebSocket = (): LoanWebSocketContextValue => {
  const context = useContext(LoanWebSocketContext);
  if (context === undefined) {
    throw new Error('useLoanWebSocket must be used within a LoanWebSocketProvider');
  }
  return context;
};

export default LoanWebSocketContext;
