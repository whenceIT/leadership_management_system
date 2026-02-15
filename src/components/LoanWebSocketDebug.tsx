'use client';

import { useLoanUpdates, type LoanData } from '@/hooks/useLoanUpdates';

/**
 * LoanWebSocketDebug Component
 * Use this to test and verify WebSocket connection
 * Shows connection status and all incoming loan events
 */
export default function LoanWebSocketDebug() {
  const { latestLoan, isConnected, error, reconnect } = useLoanUpdates();

  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="font-bold text-lg mb-2">🔌 WebSocket Debug</h3>
      
      {/* Connection Status */}
      <div className="mb-2">
        <span className="font-semibold">Status: </span>
        {isConnected ? (
          <span className="text-green-600 font-bold">🟢 Connected</span>
        ) : (
          <span className="text-red-600 font-bold">🔴 Disconnected</span>
        )}
      </div>

      {/* Reconnect Button */}
      {!isConnected && (
        <button
          onClick={reconnect}
          className="mb-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Reconnect
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 rounded">
          <span className="font-semibold text-red-700">Error: </span>
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Latest Loan Data */}
      <div className="mt-2">
        <span className="font-semibold">Latest Loan: </span>
        {latestLoan ? (
          <pre className="mt-1 p-2 bg-white rounded text-sm overflow-x-auto">
            {JSON.stringify(latestLoan, null, 2)}
          </pre>
        ) : (
          <span className="text-gray-500">No loan received yet</span>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Check browser console (F12) for detailed logs
      </div>
    </div>
  );
}
