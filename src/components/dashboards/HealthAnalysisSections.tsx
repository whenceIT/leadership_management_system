'use client';

import React, { useMemo } from 'react';
import { useOffice } from '@/hooks/useOffice';
import { useUserPosition } from '@/hooks/useUserPosition';

// Interfaces for analysis data
export interface TrendAnalysisData {
  overallScoreChange: number;
  previousScore: number;
  primaryDeclines: { parameter: string; change: number }[];
  geographicOrigin: { provinceId: string; percentage: number };
  branchLevel: { officeId: string; change: number }[];
}

export interface RootCauseAnalysisData {
  primaryDriver: { metric: string; score: number; target: number };
  secondaryDriver: { metric: string; score: number; target: number };
  geographicConcentration: {
    provinceId: string;
    percentage: number;
    institutionalPercentage: number;
    contribution: number;
    branches: {
      officeId: string;
      percentage: number;
      contribution: number;
      loanConsultants: {
        name: string;
        percentage: number;
        par: number;
        recovery: number;
      }[];
    }[];
  }[];
}

export interface RecommendedAction {
  timeframe: 'immediate' | '7days' | '30days';
  description: string;
}

export interface TimelineEvent {
  actor: string;
  action: string;
  timestamp: string;
}

export interface AnalysisData {
  trendAnalysis?: TrendAnalysisData;
  rootCauseAnalysis?: RootCauseAnalysisData;
  recommendedActions?: RecommendedAction[];
  timelineEvents?: TimelineEvent[];
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
}

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
}: HealthAnalysisSectionsProps) {
  const { getOfficeName, getOffice, getOfficesByProvince } = useOffice();
  const { user, positionName } = useUserPosition();

  // Calculate trend analysis
  const trendAnalysis = useMemo((): TrendAnalysisData => {
    // Calculate overall score change (mock data for now, should come from API)
    const previousScore = 68.5;
    const currentScore = overallScore || 60.2;
    const overallScoreChange = previousScore - currentScore;

    // Calculate primary declines
    const primaryDeclines = parameters
      .map(param => {
        const current = parseFloat(param.userLevelAvg.replace('%', ''));
        // Mock previous values (should come from API)
        const previous = current + (Math.random() * 15);
        const change = previous - current;
        return {
          parameter: param.shortName,
          change: parseFloat(change.toFixed(1))
        };
      })
      .filter(item => item.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 2);

    // Geographic origin of decline (mock data)
    const geographicOrigin = { provinceId: '3', percentage: 42 }; // Eastern Province

    // Branch level declines (mock data)
    const branchLevel = [
      { officeId: '6', change: 31 }, // Chipata Branch (Eastern Province)
      { officeId: '33', change: 18 } // Petauke Branch (Eastern Province)
    ];

    return {
      overallScoreChange: parseFloat(overallScoreChange.toFixed(1)),
      previousScore,
      primaryDeclines,
      geographicOrigin,
      branchLevel
    };
  }, [parameters, overallScore]);

  // Calculate root cause analysis
  const rootCauseAnalysis = useMemo((): RootCauseAnalysisData => {
    // Primary and secondary drivers based on metrics
    const primaryDriver = {
      metric: 'Month-1 Default',
      score: month1DefaultPerformanceData?.month_1_default_rate || 20.0,
      target: 40
    };

    const secondaryDriver = {
      metric: '3-Month Recovery',
      score: month3RecoveryAchievementsData?.recovery_rate_3_months || 12.9,
      target: 30
    };

    // Geographic concentration (mock data)
    const geographicConcentration = [
      {
        provinceId: '3',
        percentage: 22,
        institutionalPercentage: 38,
        contribution: 42,
        branches: [
          {
            officeId: '6',
            percentage: 15,
            contribution: 60,
            loanConsultants: [
              {
                name: 'LC Mukuka',
                percentage: 8,
                par: 45,
                recovery: 12
              },
              {
                name: 'LC Banda',
                percentage: 12,
                par: 38,
                recovery: 18
              }
            ]
          }
        ]
      }
    ];

    return {
      primaryDriver,
      secondaryDriver,
      geographicConcentration
    };
  }, [month1DefaultPerformanceData, month3RecoveryAchievementsData]);

  // Generate recommended actions
  const recommendedActions = useMemo((): RecommendedAction[] => {
    const actions: RecommendedAction[] = [];

    if (userLevel === 'branch' || userLevel === 'province') {
      actions.push(
        {
          timeframe: 'immediate',
          description: 'Portfolio reassignment for LC Mukuka and LC Banda (per Section 11)'
        },
        {
          timeframe: '7days',
          description: 'Branch Manager intervention on 30-60 day delinquent accounts'
        },
        {
          timeframe: '30days',
          description: 'District Manager review of collection practices at problematic branches'
        }
      );
    }

    return actions;
  }, [userLevel]);

  // Get timeline events
  const timelineEvents = useMemo((): TimelineEvent[] => {
    // In a real implementation, this would fetch from an API
    const events: TimelineEvent[] = [
      {
        actor: 'Performance Manager',
        action: 'notified',
        timestamp: '2024-07-15 09:34'
      },
      {
        actor: 'Branch Manager',
        action: 'acknowledged',
        timestamp: '2024-07-15 14:20'
      },
      {
        actor: 'District Manager',
        action: 'scheduled follow-up review',
        timestamp: '2024-07-22'
      }
    ];

    return events;
  }, []);

  // Render trend analysis
  const renderTrendAnalysis = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📉 TREND ANALYSIS (vs last month):</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p>• Overall Score: ▼ {trendAnalysis.overallScoreChange}% (from {trendAnalysis.previousScore}%)</p>
          <p>• Primary Declines: {trendAnalysis.primaryDeclines.map(d => `${d.parameter} (▼${d.change}%)`).join(', ')}</p>
          <p>• Geographic Origin: {trendAnalysis.geographicOrigin.percentage}% of decline from Eastern Province</p>
          <p>• Branch-Level: {trendAnalysis.branchLevel.map(b => `${getOfficeName(b.officeId)} (Eastern) ▼${b.change}%`).join(', ')}</p>
        </div>
      </div>
    );
  };

  // Render root cause analysis
  const renderRootCauseAnalysis = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">🔍 ROOT CAUSE ANALYSIS:</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p>• Primary Driver: {rootCauseAnalysis.primaryDriver.metric} ({rootCauseAnalysis.primaryDriver.score}/{rootCauseAnalysis.primaryDriver.target}pp) - {rootCauseAnalysis.primaryDriver.target - rootCauseAnalysis.primaryDriver.score}pp shortfall</p>
          <p>• Secondary: {rootCauseAnalysis.secondaryDriver.metric} ({rootCauseAnalysis.secondaryDriver.score}/{rootCauseAnalysis.secondaryDriver.target}pp) - {rootCauseAnalysis.secondaryDriver.target - rootCauseAnalysis.secondaryDriver.score}pp shortfall</p>
          <p>• Geographic Concentration:</p>
          {rootCauseAnalysis.geographicConcentration.map((province, index) => (
            <React.Fragment key={index}>
              <p className="ml-4"> - Eastern Province: {province.percentage}% (vs {province.institutionalPercentage}% inst) - contributing {province.contribution}% of problem</p>
              {province.branches.map((branch, branchIndex) => (
                <React.Fragment key={branchIndex}>
                  <p className="ml-4"> - {getOfficeName(branch.officeId)} (Eastern): {branch.percentage}% - contributing {branch.contribution}% of provincial problem</p>
                  {branch.loanConsultants.map((lc, lcIndex) => (
                    <p key={lcIndex} className="ml-4"> - {lc.name} ({getOfficeName(branch.officeId)}): {lc.percentage}% - PAR {lc.par}%, Recovery {lc.recovery}%</p>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render alerts
  const renderAlerts = () => {
    const criticalParams = parameters.filter(param => param.status === 'critical');
    const warningParams = parameters.filter(param => param.status === 'warning');
    const goodParams = parameters.filter(param => param.status === 'good');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">⚠️ ALERTS:</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {criticalParams.map((param, index) => (
            <p key={index}>🔴 CRITICAL: {param.shortName} ({param.userLevelAvg}) - {Math.abs(parseFloat(param.variance.replace('%', '')))}pp below target</p>
          ))}
          {warningParams.map((param, index) => (
            <p key={index}>🟠 WARNING: {param.shortName} ({param.userLevelAvg}) - {Math.abs(parseFloat(param.variance.replace('%', '')))}pp below target</p>
          ))}
          {goodParams.slice(0, 1).map((param, index) => (
            <p key={index}>🟢 GOOD: {param.shortName} ({param.userLevelAvg}) - Near target</p>
          ))}
        </div>
      </div>
    );
  };

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

  // Render timeline tracking
  const renderTimelineTracking = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800 md:col-span-2">
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">⏰ TIMELINE TRACKING:</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {timelineEvents.map((event, index) => (
            <p key={index}>• {event.actor} {event.action}: {event.timestamp}</p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Trend Analysis */}
      {renderTrendAnalysis()}

      {/* Root Cause Analysis */}
      {(userLevel === 'branch' || userLevel === 'province' || userLevel === 'district') && renderRootCauseAnalysis()}

      {/* Alerts */}
      {userLevel === 'institution' && renderAlerts()}

      {/* Recommended Actions */}
      {(userLevel === 'branch' || userLevel === 'province') && renderRecommendedActions()}

      {/* Timeline Tracking */}
      {(userLevel === 'branch' || userLevel === 'province') && renderTimelineTracking()}
    </div>
  );
}

export default HealthAnalysisSections;
