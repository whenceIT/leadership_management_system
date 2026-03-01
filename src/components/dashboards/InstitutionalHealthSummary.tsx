'use client';

import React, { useState } from 'react';

interface ParameterSummary {
  name: string;
  shortName: string;
  institutionalAvg: string;
  userLevelAvg: string;
  target: string;
  variance: string;
  varianceAbs: string;
  trend: '↑' | '↓' | '→';
  status: 'good' | 'warning' | 'critical';
}

interface KeyMetric {
  parameter: string;
  institutionalAvg: string;
  currentPeriod: string;
  target: string;
  variance: string;
  trend: '↑' | '↓' | '→';
}

interface RecentActivity {
  time: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  parameter: string;
}

interface InstitutionalHealthSummaryProps {
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  userLevelLabel: string;
  parameters: ParameterSummary[];
  keyMetrics?: KeyMetric[];
  recentActivities?: RecentActivity[];
  overallScore?: number;
  overallInstAvg?: number;
  overallTarget?: number;
}

function getTrendColor(trend: '↑' | '↓' | '→', status: 'good' | 'warning' | 'critical') {
  if (status === 'critical') return 'text-red-600 dark:text-red-400';
  if (status === 'warning') return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

function getStatusBadge(status: 'good' | 'warning' | 'critical') {
  switch (status) {
    case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
}

function getVarianceColor(variance: string) {
  if (variance.startsWith('+')) return 'text-red-600 dark:text-red-400 font-semibold';
  if (variance.startsWith('-')) return 'text-green-600 dark:text-green-400 font-semibold';
  return 'text-gray-600 dark:text-gray-400';
}

function getTrendBadge(trend: '↑' | '↓' | '→') {
  if (trend === '↑') return 'text-red-600 dark:text-red-400 text-lg font-bold';
  if (trend === '↓') return 'text-green-600 dark:text-green-400 text-lg font-bold';
  return 'text-gray-500 dark:text-gray-400 text-lg font-bold';
}

export function InstitutionalHealthSummary({
  userLevel,
  userLevelLabel,
  parameters,
  keyMetrics,
  recentActivities = [],
  overallScore,
  overallInstAvg,
  overallTarget
}: InstitutionalHealthSummaryProps) {
  const [activeTab, setActiveTab] = useState<'composite' | 'metrics'>('metrics');

  const levelLabel = {
    institution: 'Institutional',
    province: 'Provincial',
    district: 'District',
    branch: 'Branch',
    consultant: 'Personal'
  }[userLevel];

  return (
    <div className="space-y-4">
      {/* Overall Health Banner */}
      {overallScore !== undefined && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Institutional Health Dashboard</p>
              <p className="text-white font-semibold mt-0.5">{userLevelLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-white">{overallScore}%</p>
              <p className="text-gray-400 text-xs">Overall Health Score</p>
            </div>
          </div>
          {overallInstAvg !== undefined && overallTarget !== undefined && (
            <div className="grid grid-cols-3 gap-4 text-center mt-3 pt-3 border-t border-gray-700">
              <div>
                <p className="text-gray-400 text-xs">Current</p>
                <p className="text-white font-bold">{overallScore}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Inst. Avg</p>
                <p className={`font-bold ${overallScore >= overallInstAvg ? 'text-green-400' : 'text-red-400'}`}>{overallInstAvg}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Target</p>
                <p className="text-gray-300 font-bold">{overallTarget}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'metrics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Key Metrics View
        </button>
        <button
          onClick={() => setActiveTab('composite')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'composite'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Composite Index View
        </button>
      </div>

      {/* Key Metrics View (like the roadmap example) */}
      {activeTab === 'metrics' && keyMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {levelLabel} Performance — Key Metrics
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{userLevelLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Headline Parameter</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Institutional Avg</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Period</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variance</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {keyMetrics.map((metric, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{metric.parameter}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{metric.institutionalAvg}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{metric.currentPeriod}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{metric.target}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${getVarianceColor(metric.variance)}`}>{metric.variance}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={getTrendBadge(metric.trend)}>{metric.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Composite Index View */}
      {activeTab === 'composite' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Five Headline Parameters — {levelLabel} Composite Index
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{userLevelLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inst. Avg</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{levelLabel} Avg</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variance</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {parameters.map((param, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{param.shortName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{param.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{param.institutionalAvg}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{param.userLevelAvg}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{param.target}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${getVarianceColor(param.variance)}`}>
                        {param.variance}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">({param.varianceAbs})</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={getTrendBadge(param.trend)}>{param.trend}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(param.status)}`}>
                        {param.status === 'good' ? 'GOOD' : param.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Activity Causing Change</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentActivities.map((activity, index) => (
              <div key={index} className="px-5 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  activity.impact === 'positive' ? 'bg-green-500' :
                  activity.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{activity.time}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{activity.parameter}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data generators for each role level
export function getInstitutionalSummaryData(level: 'institution' | 'province' | 'district' | 'branch' | 'consultant', label: string) {
  const parameters: ParameterSummary[] = [
    {
      name: "Branch Structure & Staffing Index",
      shortName: "BSSI",
      institutionalAvg: "78%",
      userLevelAvg: level === 'institution' ? "78%" : level === 'province' ? "76%" : level === 'district' ? "80%" : level === 'branch' ? "82%" : "N/A",
      target: "85%",
      variance: level === 'institution' ? "-7%" : level === 'province' ? "-9%" : level === 'district' ? "-5%" : level === 'branch' ? "-3%" : "N/A",
      varianceAbs: level === 'institution' ? "-7pp" : level === 'province' ? "-9pp" : level === 'district' ? "-5pp" : level === 'branch' ? "-3pp" : "N/A",
      trend: '↓',
      status: 'warning'
    },
    {
      name: "Loan Consultant Performance Index",
      shortName: "LCPI",
      institutionalAvg: "62%",
      userLevelAvg: level === 'institution' ? "62%" : level === 'province' ? "58%" : level === 'district' ? "65%" : level === 'branch' ? "68%" : "85%",
      target: "80%",
      variance: level === 'institution' ? "-18%" : level === 'province' ? "-22%" : level === 'district' ? "-15%" : level === 'branch' ? "-12%" : "+5%",
      varianceAbs: level === 'institution' ? "-18pp" : level === 'province' ? "-22pp" : level === 'district' ? "-15pp" : level === 'branch' ? "-12pp" : "+5pp",
      trend: '↓',
      status: 'critical'
    },
    {
      name: "Loan Products & Interest Rates Index",
      shortName: "LPIRI",
      institutionalAvg: "74%",
      userLevelAvg: level === 'institution' ? "74%" : level === 'province' ? "71%" : level === 'district' ? "76%" : level === 'branch' ? "82%" : "70%",
      target: "80%",
      variance: level === 'institution' ? "-6%" : level === 'province' ? "-9%" : level === 'district' ? "-4%" : level === 'branch' ? "+2%" : "-10%",
      varianceAbs: level === 'institution' ? "-6pp" : level === 'province' ? "-9pp" : level === 'district' ? "-4pp" : level === 'branch' ? "+2pp" : "-10pp",
      trend: '→',
      status: 'warning'
    },
    {
      name: "Risk Management & Defaults Index",
      shortName: "RMDI",
      institutionalAvg: "52%",
      userLevelAvg: level === 'institution' ? "52%" : level === 'province' ? "48%" : level === 'district' ? "55%" : level === 'branch' ? "38%" : "60%",
      target: "75%",
      variance: level === 'institution' ? "-23%" : level === 'province' ? "-27%" : level === 'district' ? "-20%" : level === 'branch' ? "-37%" : "-15%",
      varianceAbs: level === 'institution' ? "-23pp" : level === 'province' ? "-27pp" : level === 'district' ? "-20pp" : level === 'branch' ? "-37pp" : "-15pp",
      trend: '↓',
      status: 'critical'
    },
    {
      name: "Revenue & Performance Metrics Index",
      shortName: "RPMI",
      institutionalAvg: "65%",
      userLevelAvg: level === 'institution' ? "65%" : level === 'province' ? "61%" : level === 'district' ? "67%" : level === 'branch' ? "71%" : "58%",
      target: "75%",
      variance: level === 'institution' ? "-10%" : level === 'province' ? "-14%" : level === 'district' ? "-8%" : level === 'branch' ? "-4%" : "-17%",
      varianceAbs: level === 'institution' ? "-10pp" : level === 'province' ? "-14pp" : level === 'district' ? "-8pp" : level === 'branch' ? "-4pp" : "-17pp",
      trend: '→',
      status: 'warning'
    }
  ];

  // Key metrics (specific sub-metrics like the roadmap example)
  const keyMetrics: KeyMetric[] = [
    {
      parameter: "Default Rate",
      institutionalAvg: "28.36%",
      currentPeriod: level === 'institution' ? "30.00%" : level === 'province' ? "32.00%" : level === 'district' ? "27.50%" : level === 'branch' ? "25.00%" : "20.00%",
      target: "≤27%",
      variance: level === 'institution' ? "+2%" : level === 'province' ? "+5%" : level === 'district' ? "+0.5%" : level === 'branch' ? "-2%" : "-7%",
      trend: level === 'institution' ? '↑' : level === 'province' ? '↑' : level === 'district' ? '↑' : '↓'
    },
    {
      parameter: "Recovery within 3 months",
      institutionalAvg: "56.05%",
      currentPeriod: level === 'institution' ? "51%" : level === 'province' ? "48%" : level === 'district' ? "55%" : level === 'branch' ? "60%" : "65%",
      target: "≥60%",
      variance: level === 'institution' ? "-9%" : level === 'province' ? "-12%" : level === 'district' ? "-5%" : level === 'branch' ? "0%" : "+5%",
      trend: level === 'institution' ? '↓' : level === 'province' ? '↓' : level === 'district' ? '↓' : '↑'
    },
    {
      parameter: "Collection Rate (Month-1)",
      institutionalAvg: "71.64%",
      currentPeriod: level === 'institution' ? "68%" : level === 'province' ? "65%" : level === 'district' ? "70%" : level === 'branch' ? "75%" : "80%",
      target: "≥71.64%",
      variance: level === 'institution' ? "-3.64%" : level === 'province' ? "-6.64%" : level === 'district' ? "-1.64%" : level === 'branch' ? "+3.36%" : "+8.36%",
      trend: level === 'institution' ? '↓' : level === 'province' ? '↓' : '↑'
    },
    {
      parameter: "Staff Adequacy Score",
      institutionalAvg: "80%",
      currentPeriod: level === 'institution' ? "78%" : level === 'province' ? "76%" : level === 'district' ? "82%" : level === 'branch' ? "80%" : "N/A",
      target: "≥90%",
      variance: level === 'institution' ? "-12%" : level === 'province' ? "-14%" : level === 'district' ? "-8%" : level === 'branch' ? "-10%" : "N/A",
      trend: '↓'
    },
    {
      parameter: "Revenue Achievement",
      institutionalAvg: "85%",
      currentPeriod: level === 'institution' ? "82%" : level === 'province' ? "79%" : level === 'district' ? "85%" : level === 'branch' ? "88%" : "92%",
      target: "≥100%",
      variance: level === 'institution' ? "-18%" : level === 'province' ? "-21%" : level === 'district' ? "-15%" : level === 'branch' ? "-12%" : "-8%",
      trend: '→'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      time: "2 hours ago",
      description: "Default rate increased from 28.36% to 30% — 60% of deviation from Eastern Province",
      impact: 'negative',
      parameter: "RMDI"
    },
    {
      time: "Yesterday",
      description: "Branch X disbursement spike detected — 3 LCs contributing 70% of new defaults",
      impact: 'negative',
      parameter: "LCPI"
    },
    {
      time: "2 days ago",
      description: "Recovery rate improved by 3.2% following intensified collections drive",
      impact: 'positive',
      parameter: "RMDI"
    },
    {
      time: "3 days ago",
      description: "New branch opened in Lusaka — staff adequacy score improved by 5pp",
      impact: 'positive',
      parameter: "BSSI"
    }
  ];

  const overallScores = {
    institution: 66,
    province: 63,
    district: 69,
    branch: 68,
    consultant: 72
  };

  return {
    parameters,
    keyMetrics,
    recentActivities,
    overallScore: overallScores[level],
    overallInstAvg: 66,
    overallTarget: 79
  };
}
