'use client';

import { useState, useEffect } from 'react';
import { useLoanUpdates, type LoanData } from '@/hooks/useLoanUpdates';
import LoanWebSocketDebug from '@/components/LoanWebSocketDebug';
import { connectWebSocket } from '@/lib/websocket';

/**
 * WebSocket Test Page
 * Navigate to /websocket-test to test the connection
 * 
 * Make sure your Laravel WebSocket server is running:
 * php artisan websockets:serve
 */
export default function WebSocketTestPage() {
  const { latestLoan, isConnected, error, reconnect } = useLoanUpdates();
  const [showAlert, setShowAlert] = useState(false);

  // Show alert when new loan is received
  useEffect(() => {
    if (latestLoan && isConnected) {
      setShowAlert(true);
      const timer: ReturnType<typeof setTimeout> = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestLoan, isConnected]);

  const handleTestConnection = () => {
    connectWebSocket();
  };

  const getBorrowerName = (loan: LoanData | null): string => {
    if (!loan) return 'Unknown';
    const name = loan.client_name || loan.borrower_name;
    return typeof name === 'string' ? name : 'Unknown';
  };

  const getLoanAmount = (loan: LoanData | null): number => {
    if (!loan) return 0;
    return typeof loan.amount === 'number' ? loan.amount : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebSocket Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Make sure <code className="bg-gray-100 px-2 py-1">php artisan websockets:serve</code> is running</li>
            <li>Open browser console (F12) to see connection logs</li>
            <li>Create a loan in your Laravel app</li>
            <li>You should see the loan data appear below</li>
          </ol>
        </div>

        {/* Alert for new loan */}
        {showAlert && latestLoan && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
            <span className="font-bold text-green-700">
              New loan created: {getBorrowerName(latestLoan)} - ${getLoanAmount(latestLoan)}
            </span>
          </div>
        )}

        {/* Debug Component */}
        <LoanWebSocketDebug />

        {/* Manual Test Button */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Test</h2>
          <button
            onClick={() => {
              reconnect();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Reconnect
          </button>
          <button
            onClick={handleTestConnection}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Test Connection
          </button>
        </div>

        {/* Raw Event Display */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Event Data</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
            {latestLoan ? JSON.stringify(latestLoan, null, 2) : 'No loan events received yet...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
