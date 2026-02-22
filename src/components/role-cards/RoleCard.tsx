'use client';

import React from 'react';
import { roleCardsData, defaultRoleCard, RoleCardConfig } from '@/data/role-cards-data';
import { getOfficeNameById } from '@/hooks/useOffice';

/**
 * Get current user position from localStorage
 * @returns The user's position or 'Branch Manager' as default
 */
function getCurrentUserPosition(): string {
  if (typeof window === 'undefined') {
    return 'Branch Manager';
  }
  
  const storedUser = localStorage.getItem('thisUser');
  if (!storedUser) {
    return 'Branch Manager';
  }
  
  try {
    const user = JSON.parse(storedUser);
    return user.position || user.role || 'Branch Manager';
  } catch (e) {
    console.error('Error parsing user data:', e);
    return 'Branch Manager';
  }
}

/**
 * Get user office name from localStorage
 * @returns The user's office name or 'Head Office' as default
 */
function getUserOfficeName(): string {
  if (typeof window === 'undefined') {
    return 'Head Office';
  }
  
  const storedUser = localStorage.getItem('thisUser');
  if (!storedUser) {
    return 'Head Office';
  }
  
  try {
    const user = JSON.parse(storedUser);
    if (user.office_id) {
      return getOfficeNameById(user.office_id) || 'Head Office';
    }
    return user.office_name || 'Head Office';
  } catch (e) {
    console.error('Error parsing user data:', e);
    return 'Head Office';
  }
}

/**
 * RoleCard Component
 * Displays comprehensive role card based on user's position from localStorage
 * Fallback to Branch Manager if position not found
 */
export default function RoleCard() {
  const [position, setPosition] = React.useState<string>('Branch Manager');
  const [roleCard, setRoleCard] = React.useState<RoleCardConfig>(defaultRoleCard);

  React.useEffect(() => {
    // Get user position from localStorage
    const userPosition = getCurrentUserPosition();
    setPosition(userPosition);

    // Get role card for this position
    const card = roleCardsData[userPosition];
    if (card) {
      setRoleCard(card);
    } else {
      // Use default if position not found
      setRoleCard(defaultRoleCard);
    }
  }, []);

  // Get status color for KPIs
  const getKPIColor = (baseline: string, target: string): string => {
    // Simple heuristic: if baseline has %, compare numeric values
    const baselineNum = parseFloat(baseline.replace(/[^0-9.-]/g, ''));
    const targetNum = parseFloat(target.replace(/[^0-9.-]/g, ''));
    
    if (isNaN(baselineNum) || isNaN(targetNum)) {
      return 'text-gray-600 dark:text-gray-400';
    }
    
    if (baselineNum <= targetNum) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {roleCard.title}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Role Card | {position}
          </p>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-brand-100 text-sm">Department</p>
            <p className="font-semibold mt-1">{roleCard.department}</p>
          </div>
          <div>
            <p className="text-brand-100 text-sm">Reports To</p>
            <p className="font-semibold mt-1">{roleCard.reportsTo}</p>
          </div>
          <div>
            <p className="text-brand-100 text-sm">Direct Reports</p>
            <p className="font-semibold mt-1">{roleCard.directReports}</p>
          </div>
          <div>
            <p className="text-brand-100 text-sm">Location</p>
            <p className="font-semibold mt-1">{getUserOfficeName()}</p>
          </div>
        </div>
      </div>

      {/* Job Purpose */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Job Purpose
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {roleCard.jobPurpose}
        </p>
      </div>

      {/* Key Responsibilities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Responsibilities
        </h3>
        <div className="space-y-6">
          {roleCard.responsibilities.map((category, catIndex) => (
            <div key={catIndex}>
              <h4 className="text-sm font-medium text-brand-500 dark:text-brand-400 mb-3">
                {category.category}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Key Performance Indicators (KPIs)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  KPI
                </th>
                <th className="px-6 py-3 font-medium text-gray text-left text-xs-500 dark:text-gray-400 uppercase">
                  Baseline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {roleCard.kpis.map((kpi, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {kpi.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {kpi.baseline}
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium ${getKPIColor(kpi.baseline, kpi.target)}`}>
                    {kpi.target}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {kpi.weight}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authority & Review Cycles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authority */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Decision Authority
          </h3>
          <div className="space-y-3">
            {Object.entries(roleCard.authority).map(([key, value]) => (
              value && (
                <div key={key} className="flex items-start gap-3">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded capitalize min-w-[100px]">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {value}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Review Cycles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Review Cycles
          </h3>
          <div className="space-y-4">
            {roleCard.reviewCycles.map((review, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {review.cycle}
                  </span>
                  <span className="text-xs font-medium text-brand-500">
                    {review.description.split(':')[0]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {review.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Required Competencies */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Required Competencies
        </h3>
        <div className="flex flex-wrap gap-3">
          {roleCard.competencies.map((competency, index) => (
            <span
              key={index}
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              {competency}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
