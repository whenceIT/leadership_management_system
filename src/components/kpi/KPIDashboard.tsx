'use client';

import React from 'react';
import { kpiDataByPosition, defaultKPIData, getCurrentUserPosition, calculateOverallScore, PositionKPIConfig, KPICategory, KSIMetric } from '@/data/kpi-data';

/**
 * KPI Dashboard Component
 * Dynamically displays KPIs based on the user's position from localStorage
 * Fallback to Branch Manager if position not found
 */
export default function KPIDashboard() {
  const [position, setPosition] = React.useState<string>('Branch Manager');
  const [kpiConfig, setKpiConfig] = React.useState<PositionKPIConfig>(defaultKPIData);

  React.useEffect(() => {
    // Get user position from localStorage
    const userPosition = getCurrentUserPosition();
    setPosition(userPosition);

    // Get KPI configuration for this position
    const config = kpiDataByPosition[userPosition];
    if (config) {
      setKpiConfig(config);
    } else {
      // Use default if position not found
      setKpiConfig(defaultKPIData);
    }
  }, []);

  // Format value based on type
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'rating':
        return value.toFixed(1);
      default:
        return new Intl.NumberFormat('en-ZM').format(value);
    }
  };

  // Get status color based on performance
  const getStatusColor = (metric: KSIMetric): string => {
    if (metric.lowerIsBetter) {
      if (metric.value <= metric.target) return 'text-green-600 dark:text-green-400';
      if (metric.value <= metric.target * 1.1) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    } else {
      if (metric.value >= metric.target) return 'text-green-600 dark:text-green-400';
      if (metric.value >= metric.target * 0.9) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
  };

  // Get progress percentage
  const getProgress = (metric: KSIMetric): number => {
    if (metric.lowerIsBetter) {
      return Math.max(0, Math.min(100, 100 - ((metric.value - metric.target) / metric.target) * 100));
    }
    return Math.max(0, Math.min(100, (metric.value / metric.target) * 100));
  };

  // Get alert color
  const getAlertColor = (type: string): string => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  // Get alert icon and colors
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {kpiConfig.title}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {kpiConfig.description} | Position: {position}
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

      {/* Alerts Section */}
      {kpiConfig.alerts.length > 0 && (
        <div className="space-y-3">
          {kpiConfig.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {alert.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Categories */}
      {kpiConfig.kpiCategories.map((category, catIndex) => (
        <div key={catIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.metrics.map((metric, metricIndex) => (
                <div
                  key={metricIndex}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {metric.name}
                    </span>
                    <span className={`text-lg font-bold ${getStatusColor(metric)}`}>
                      {formatValue(metric.value, metric.format)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>Target: {formatValue(metric.target, metric.format)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          getProgress(metric) >= 90
                            ? 'bg-green-500'
                            : getProgress(metric) >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${getProgress(metric)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Weight: {metric.weight}%
                    </span>
                    <span className={`font-medium ${getStatusColor(metric)}`}>
                      {getProgress(metric).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Overall Performance Summary */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Overall Performance</h3>
            <p className="text-brand-100 text-sm mt-1">
              Based on weighted KPI achievement across all categories
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              {calculateOverallScore(
                kpiConfig.kpiCategories.flatMap(c => c.metrics)
              )}%
            </p>
            <p className="text-brand-100 text-sm mt-1">
              {kpiConfig.kpiCategories.flatMap(c => c.metrics).length} KPIs tracked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
