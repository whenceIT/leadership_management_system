'use client';

import { useMemo } from 'react';
import { Suggestion } from '@/lib/kpiThresholds';
import SuggestionsCarousel from './SuggestionsCarousel';

export interface RecommendedAction {
  timeframe: 'immediate' | '7days' | '30days';
  description: string;
}

interface HealthAnalysisSectionsProps {
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  parameters: any[];
  keyMetrics?: any[];
  recentActivities?: any[];
  overallScore?: number;
  overallInstAvg?: number;
  overallTarget?: number;
  staffAdequacyData?: any;
  productivityAchievementData?: any;
  vacancyImpactData?: any;
  volumeAchievementData?: any;
  loanPortfolioLoadData?: any;
  collectionEfficiencyData?: any;
  efficiencyRatioData?: any;
  growthTrajectoryData?: any;
  longTermDelinquencyData?: any;
  month1DefaultPerformanceData?: any;
  month3RecoveryAchievementsData?: any;
  portfolioQualityData?: any;
  productDiversificationData?: any;
  productRiskScoreData?: any;
  rollRateControlData?: any;
  yieldAchievementsData?: any;
  revenueAchievementsData?: any;
  profitabilityContributionData?: any;
  cashPositionData?: any;
  aboveThresholdRiskData?: any;
  belowThresholdRiskData?: any;
  approvedExceptionRatioData?: any;
  suggestions?: Suggestion[];
}

const SEVERITY_RANK: Record<Suggestion['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
  good: 3,
};

function HealthAnalysisSections({
  userLevel,
  parameters,
  keyMetrics = [],
  recentActivities = [],
  overallScore,
  overallInstAvg,
  overallTarget,
  staffAdequacyData,
  productivityAchievementData,
  vacancyImpactData,
  volumeAchievementData,
  loanPortfolioLoadData,
  collectionEfficiencyData,
  efficiencyRatioData,
  growthTrajectoryData,
  longTermDelinquencyData,
  month1DefaultPerformanceData,
  month3RecoveryAchievementsData,
  portfolioQualityData,
  productDiversificationData,
  productRiskScoreData,
  rollRateControlData,
  yieldAchievementsData,
  revenueAchievementsData,
  profitabilityContributionData,
  cashPositionData,
  aboveThresholdRiskData,
  belowThresholdRiskData,
  approvedExceptionRatioData,
  suggestions = [],
}: HealthAnalysisSectionsProps) {
  // Derive recommended actions automatically from the centralised suggestions engine.
  // This covers every headline + supporting KPI with no hardcoded figures.
  const recommendedActions = useMemo((): RecommendedAction[] => {
    return [...suggestions]
      .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
      .map((s): RecommendedAction => {
        let timeframe: RecommendedAction['timeframe'] = '30days';
        if (s.severity === 'critical') timeframe = 'immediate';
        else if (s.severity === 'warning') timeframe = '7days';
        return {
          timeframe,
          description: `${s.metric}: ${s.recommendation}`,
        };
      });
  }, [suggestions]);

  // Render recommended actions
  const renderRecommendedActions = () => {
    if (recommendedActions.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">✅ RECOMMENDED ACTIONS:</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {recommendedActions.map((action, index) => (
            <p key={index}>• {action.timeframe === 'immediate' ? 'Immediate' : action.timeframe === '7days' ? 'Within 7 days' : 'Within 30 days'}: {action.description}</p>
          ))}
        </div>
      </div>
    );
  };

  // Render KPI threshold-based suggestions (fully automatic across all headline + supporting metrics)
  const renderKPISuggestions = () => {
    const critical = suggestions.filter((s) => s.severity === 'critical');
    const warnings = suggestions.filter((s) => s.severity === 'warning');
    const infos = suggestions.filter((s) => s.severity === 'info');
    const visible = [...critical, ...warnings, ...infos];

    if (visible.length === 0) return null;

    const severityIcon = (sev: Suggestion['severity']) => {
      switch (sev) {
        case 'critical': return '🔴';
        case 'warning': return '🟠';
        case 'info': return '🔵';
        default: return '🟢';
      }
    };

    const locationLabel = (s: Suggestion) => {
      if (!s.location) return '';
      const parts: string[] = [];
      if (s.location.provinceName) parts.push(`${s.location.provinceName} Province`);
      if (s.location.districtName) parts.push(s.location.districtName);
      if (s.location.branchName) parts.push(s.location.branchName);
      if (s.location.consultantName) parts.push(s.location.consultantName);
      return parts.length ? ` · ${parts.join(' > ')}` : '';
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-200 dark:border-purple-800 md:col-span-2">
        <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3">
          🎯 KPI THRESHOLD SUGGESTIONS
        </h4>
        <div className="space-y-3">
          {visible.map((s) => (
            <div
              key={s.id}
              className={`p-3 rounded-lg border-l-4 ${
                s.severity === 'critical'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  : s.severity === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {severityIcon(s.severity)} {s.metric}
                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                      {s.actual} vs target {s.target}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{s.finding}</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                    <span className="font-medium">Recommendation:</span> {s.recommendation}
                  </p>
                  {s.details && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.details}</p>}
                  {locationLabel(s) && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">📍{locationLabel(s)}</p>
                  )}
                </div>
                {s.severity !== 'info' && (
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {s.severity}
                  </span>
                )}
              </div>

              {s.attribution && s.attribution.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-600 dark:text-gray-400">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1">Branch / Office</th>
                        <th className="text-left px-2 py-1">Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.attribution.map((a, i) => (
                        <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-2 py-1">{a.branchName || `Branch ${a.branchId}`}</td>
                          <td className="px-2 py-1">
                            {a.issues.map((iss, j) => (
                              <span key={j} className="block">{iss}</span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {s.consultantAttribution && s.consultantAttribution.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Root-cause loan consultant users:</p>
                  <table className="min-w-full text-xs text-gray-600 dark:text-gray-400">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1">Consultant</th>
                        <th className="text-left px-2 py-1">Office</th>
                        <th className="text-left px-2 py-1">Value / Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.consultantAttribution.map((c, i) => (
                        <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-2 py-1">{c.consultantName || `LC ${c.consultantId}`}</td>
                          <td className="px-2 py-1">{c.officeName || c.officeId}</td>
                          <td className="px-2 py-1">{c.value} — {c.issue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recommended Actions (derived from the automatic suggestions) */}
      {(userLevel === 'branch' || userLevel === 'province') && renderRecommendedActions()}

      {/* KPI Threshold Suggestions (automatic, all headline + supporting metrics) */}
      {renderKPISuggestions()}
    </div>
  );
}

export default HealthAnalysisSections;
