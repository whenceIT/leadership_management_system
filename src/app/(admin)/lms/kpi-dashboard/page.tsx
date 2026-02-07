import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KPI Dashboard | LMS - Leadership Management System",
  description: "Real-time KPI tracking and performance dashboard",
};

// Mock KPI data
const kpiData = {
  branchMetrics: [
    { name: "Branch A", defaultRate: 2.1, recoveryRate: 96.5, compliance: 98 },
    { name: "Branch B", defaultRate: 3.2, recoveryRate: 92.1, compliance: 95 },
    { name: "Branch C", defaultRate: 2.5, recoveryRate: 95.2, compliance: 97 },
    { name: "Branch D", defaultRate: 1.9, recoveryRate: 97.8, compliance: 99 },
  ],
  districtMetrics: {
    overallDefaultRate: 2.8,
    overallRecoveryRate: 95.2,
    issueResolutionTime: 2.3,
    talentPipelineStrength: 85,
  },
  trends: {
    defaultRate: { current: 2.8, previous: 3.1, trend: "down" },
    recoveryRate: { current: 95.2, previous: 94.4, trend: "up" },
    compliance: { current: 97, previous: 96, trend: "up" },
  },
};

export default function KPIDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            KPI Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Real-time KPI tracking and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This quarter</option>
            <option>This year</option>
          </select>
          <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Default Rate
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {kpiData.trends.defaultRate.current}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${kpiData.trends.defaultRate.trend === 'down' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <svg className={`w-6 h-6 ${kpiData.trends.defaultRate.trend === 'down' ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpiData.trends.defaultRate.trend === 'down' ? "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" : "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"} />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            vs {kpiData.trends.defaultRate.previous}% last period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Recovery Rate
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {kpiData.trends.recoveryRate.current}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${kpiData.trends.recoveryRate.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <svg className={`w-6 h-6 ${kpiData.trends.recoveryRate.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6-6" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            vs {kpiData.trends.recoveryRate.previous}% last period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Compliance Score
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {kpiData.trends.compliance.current}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${kpiData.trends.compliance.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <svg className={`w-6 h-6 ${kpiData.trends.compliance.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            vs {kpiData.trends.compliance.previous}% last period
          </p>
        </div>
      </div>

      {/* Branch Performance Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Branch Performance Comparison
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Default Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recovery Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Compliance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {kpiData.branchMetrics.map((branch, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {branch.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {branch.defaultRate}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {branch.recoveryRate}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {branch.compliance}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        branch.defaultRate < 2.5 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : branch.defaultRate < 3.5
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {branch.defaultRate < 2.5 ? 'Excellent' : branch.defaultRate < 3.5 ? 'Needs Attention' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Predictive Analytics
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Expected Default Rate Trend
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Based on current patterns, default rate is projected to decrease by 0.3% over the next 30 days.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Risk Alert
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Branch B shows elevated Month-1 defaults. Intervention recommended within 14 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
