'use client';

import React from 'react';
import { CashHealthOffice } from '@/services/CashPositionService';

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  return value.toLocaleString();
}

interface CashHealthOfficePopupProps {
  office: CashHealthOffice;
  onClose: () => void;
}

export default function CashHealthOfficePopup({ office, onClose }: CashHealthOfficePopupProps) {
  const financials = office.financials || {};
  const scores = office.scores || {};

  const status = scores.status;
  const score = scores.overall;
  let statusColor = 'bg-gray-100 text-gray-800';
  if (status === 'GREEN') statusColor = 'bg-green-100 text-green-800';
  else if (status === 'AMBER') statusColor = 'bg-yellow-100 text-yellow-800';
  else if (status === 'RED') statusColor = 'bg-red-100 text-red-800';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Office Cash Health Details
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

        <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {office.office_name || '-'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Financial Data</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Residual Cash</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(financials.residual_cash)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Net Cash Position</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(financials.net_cash_position)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Min Loan Target</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(financials.minimum_loan_target)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Defaults</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(financials.defaults)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Irregular Cost Reserve</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(financials.irregular_cost_reserve)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Disbursed</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(office.disbursed)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Collected</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(office.collected)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Score</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Overall Score</dt>
                <dd><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{score ?? '--'}</span></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-300">Status</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{status || '--'}</dd>
              </div>
            </dl>

            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 mt-6">Reason</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
              {office.reason || 'No reason provided.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
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
