'use client';

import React from 'react';
import { CashHealthFinancials, CashHealthScores } from '@/services/CashPositionService';

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  return value.toLocaleString();
}

function getScoreBadge(score: number | undefined, status?: string): React.ReactNode {
  if (score === undefined || score === null) return <span className="text-gray-400">--</span>;
  let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  if (status === 'GREEN' || (status === undefined && score >= 80)) {
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  } else if (status === 'AMBER' || (status === undefined && score >= 60)) {
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  } else if (status === 'RED' || (status === undefined && score < 60)) {
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colorClass}`}>
      {score}
    </span>
  );
}

interface CashHealthDetailsPopupProps {
  title: string;
  name: string;
  officeCount?: number;
  financials?: CashHealthFinancials;
  scores?: CashHealthScores;
  reason?: string;
  details?: any;
  disbursed?: number;
  collected?: number;
  onClose: () => void;
}

export default function CashHealthDetailsPopup({
  title,
  name,
  officeCount,
  financials,
  scores,
  reason,
  details,
  disbursed,
  collected,
  onClose,
}: CashHealthDetailsPopupProps) {
  const fin = financials || {};
  const sc = scores || {};
  const status = sc.status;
  const score = sc.overall;

  const statusColor =
    status === 'GREEN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : status === 'AMBER' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    : status === 'RED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {name}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Financial Data</h4>
              <dl className="space-y-2">
                {officeCount !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300">Offices</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{officeCount}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Residual Cash</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(fin.residual_cash)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Net Cash Position</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(fin.net_cash_position)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Min Loan Target</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(fin.minimum_loan_target)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Defaults</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(fin.defaults)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Irregular Cost Reserve</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(fin.irregular_cost_reserve)}</dd>
                </div>
                {disbursed !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300">Disbursed</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(disbursed)}</dd>
                  </div>
                )}
                {collected !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300">Collected</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(collected)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Score</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Overall Score</dt>
                  <dd>{getScoreBadge(score, status)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 dark:text-gray-300">Status</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{status || '--'}</dd>
                </div>
                {sc.disbursement !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300">Disbursement</dt>
                    <dd>{getScoreBadge(sc.disbursement, status)}</dd>
                  </div>
                )}
                {sc.collection !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300">Collection</dt>
                    <dd>{getScoreBadge(sc.collection, status)}</dd>
                  </div>
                )}
                {sc.residual_cash !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300">Residual Cash</dt>
                    <dd>{getScoreBadge(sc.residual_cash, status)}</dd>
                  </div>
                )}
              </dl>

              {reason && (
                <>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 mt-6">Reason</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                    {reason}
                  </p>
                </>
              )}
            </div>
          </div>

          {details && Object.keys(details).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Details</h4>
              <dl className="space-y-2">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-300 capitalize">{key.replace(/_/g, ' ')}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeof value === 'number' ? formatNumber(value) : String(value || '--')}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
