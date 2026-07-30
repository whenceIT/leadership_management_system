'use client';

import React, { useState, useMemo } from 'react';
import { DashboardBase, KPICard, AlertCard, CollapsibleCard } from './DashboardBase';
import { getHeadlineParameters } from '@/data/headline-parameters-mock';
import { InstitutionalHealthSummary, getInstitutionalSummaryData, calculateCashPositionScore } from './InstitutionalHealthSummary';
import { useBranchManagerMetrics } from '@/hooks/useBranchManagerMetrics';
import { useUserKPI } from '@/hooks/useUserKPI';
import { useStaffAdequacy } from '@/hooks/useStaffAdequacy';
import { useProductivityAchievement } from '@/hooks/useProductivityAchievement';
import { useVacancyImpact } from '@/hooks/useVacancyImpact';
import { useVolumeAchievement } from '@/hooks/useVolumeAchievement';
import { useLoanPortfolioLoad } from '@/hooks/useLoanPortfolioLoad';
import { useCollectionEfficiency } from '@/hooks/useCollectionEfficiency';
import { useEfficiencyRatio } from '@/hooks/useEfficiencyRatio';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import { useLongTermDelinquency } from '@/hooks/useLongTermDelinquency';
import { useMonth1DefaultPerformance } from '@/hooks/useMonth1DefaultPerformance';
import { useMonth3RecoveryAchievements } from '@/hooks/useMonth3RecoveryAchievements';
import { usePortfolioQuality } from '@/hooks/usePortfolioQuality';
import { useProductDiversification } from '@/hooks/useProductDiversification';
import { useProductRiskScore } from '@/hooks/useProductRiskScore';
import { useRollRateControl } from '@/hooks/useRollRateControl';
import { useYieldAchievements } from '@/hooks/useYieldAchievements';
import { useRevenueAchievements } from '@/hooks/useRevenueAchievements';
import { useProfitabilityContribution } from '@/hooks/useProfitabilityContribution';
import { useCashPosition } from '@/hooks/useCashPosition';

interface BranchManagerDashboardProps {
  userTier?: string | null;
}

export default function BranchManagerDashboard({ userTier }: BranchManagerDashboardProps) {

  const {
    isLoading,
    error,
    activeLoans,
    branchStats,
    collectionRate,
    month1DefaultRate,
    collectionWaterfall,
    refreshAllMetrics
  } = useBranchManagerMetrics();

  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();

  // Build KPIs from user-specific KPI data
  const kpis = processedKPIs.length > 0 ? processedKPIs.map(kpi => ({
    name: kpi.name,
    baseline: kpi.baseline.toString(),
    target: kpi.target.toString(),
    weight: `${kpi.weight}%`
  })) : [];

  // Headline parameters using composite index approach
  const headlineParameters = getHeadlineParameters({
    onStaffRatiosDrillDown: () => setDrillView('consultants')
  });

  // Drill-down for Branch Manager: consultants -> transactions
  const [drillView, setDrillView] = useState<'consultants' | 'transactions'>('consultants');
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);

  // Fetch staff adequacy performance data
  const { data: staffAdequacyData, isLoading: isStaffAdequacyLoading, error: staffAdequacyError } = useStaffAdequacy(3); // Using branch id 3 as per example

  // Fetch productivity achievement data
  const { data: productivityAchievementData, isLoading: isProductivityLoading, error: productivityError } = useProductivityAchievement(3); // Using branch id 3 as per example

  // Fetch vacancy impact data
  const { data: vacancyImpactData, isLoading: isVacancyLoading, error: vacancyError } = useVacancyImpact(3); // Using branch id 3 as per example

  // Fetch volume achievement data
  const { data: volumeAchievementData, isLoading: isVolumeLoading, error: volumeError } = useVolumeAchievement(3); // Using branch id 3 as per example

  // Fetch loan portfolio load data
  const { data: loanPortfolioLoadData, isLoading: isLoanPortfolioLoading, error: loanPortfolioError } = useLoanPortfolioLoad(3); // Using branch id 3 as per example

  // Fetch collection efficiency data
  const { data: collectionEfficiencyData, isLoading: isCollectionEfficiencyLoading, error: collectionEfficiencyError } = useCollectionEfficiency(3);

  // Fetch efficiency ratio data
  const { data: efficiencyRatioData, isLoading: isEfficiencyRatioLoading, error: efficiencyRatioError } = useEfficiencyRatio(3);

  // Fetch growth trajectory data
  const { data: growthTrajectoryData, isLoading: isGrowthTrajectoryLoading, error: growthTrajectoryError } = useGrowthTrajectory(3);

  // Fetch long term delinquency data
  const { data: longTermDelinquencyData, isLoading: isLongTermDelinquencyLoading, error: longTermDelinquencyError } = useLongTermDelinquency(3);

  // Fetch month 1 default performance data
  const { data: month1DefaultPerformanceData, isLoading: isMonth1DefaultPerformanceLoading, error: month1DefaultPerformanceError } = useMonth1DefaultPerformance(3);

  // Fetch month 3 recovery achievements data
  const { data: month3RecoveryAchievementsData, isLoading: isMonth3RecoveryAchievementsLoading, error: month3RecoveryAchievementsError } = useMonth3RecoveryAchievements(3);

  // Fetch portfolio quality data
  const { data: portfolioQualityData, isLoading: isPortfolioQualityLoading, error: portfolioQualityError } = usePortfolioQuality(3);

  // Fetch product diversification data
  const { data: productDiversificationData, isLoading: isProductDiversificationLoading, error: productDiversificationError } = useProductDiversification(3);

  // Fetch product risk score data
  const { data: productRiskScoreData, isLoading: isProductRiskScoreLoading, error: productRiskScoreError } = useProductRiskScore(3);

  // Fetch roll rate control data
  const { data: rollRateControlData, isLoading: isRollRateControlLoading, error: rollRateControlError } = useRollRateControl(3);

  // Fetch yield achievements data
  const { data: yieldAchievementsData, isLoading: isYieldAchievementsLoading, error: yieldAchievementsError } = useYieldAchievements(3);

  // Fetch revenue achievements data
  const { data: revenueAchievementsData, isLoading: isRevenueAchievementsLoading, error: revenueAchievementsError } = useRevenueAchievements(3);

  // Fetch profitability contribution data
  const { data: profitabilityContributionData, isLoading: isProfitabilityContributionLoading, error: profitabilityContributionError } = useProfitabilityContribution(3);

  // Fetch cash position data
  const { data: cashPositionData, isLoading: isCashPositionLoading, error: cashPositionError } = useCashPosition(3);

  // Custom summary data with dynamic aggregated Branch Structure & Staffing
  const summaryData = useMemo(() => {
    const baseData = getInstitutionalSummaryData(
      'branch', 
      'Branch View', 
      staffAdequacyData, 
      productivityAchievementData, 
      vacancyImpactData, 
      loanPortfolioLoadData,
      volumeAchievementData,
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
      cashPositionData
    );
    let updatedData = { ...baseData };

    // Update key metrics with individual KPI data
    let keyMetrics = [...updatedData.keyMetrics];
    
    // Update Staff Adequacy Score key metric
    if (staffAdequacyData) {
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Staff Adequacy Score') {
          return {
            ...metric,
            institutionalAvg: staffAdequacyData?.instAvg || '--',
            currentPeriod: `${staffAdequacyData?.normalized_score || 0}%`,
            target: '100%',
            variance: `${(staffAdequacyData?.normalized_score || 0) - (staffAdequacyData?.target || 100)}%`,
            trend: ((staffAdequacyData?.normalized_score || 0) >= (staffAdequacyData?.target || 100) ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '90%',
            contribution: `${staffAdequacyData?.percentage_point || 0}/25pp ${(staffAdequacyData?.normalized_score || 0) >= (staffAdequacyData?.target || 100) ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Productivity Achievement key metric
    if (productivityAchievementData) {
      const normalizedScore = parseFloat(productivityAchievementData.normalized_score || '0');
      const percentagePoint = parseFloat(productivityAchievementData.percentage_point || '0');
      const weight = parseFloat((productivityAchievementData.weight || '0%').replace('%', ''));
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Productivity Achievement') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore}%`,
            target: '≥100%',
            variance: `${normalizedScore - productivityAchievementData.target}%`,
            trend: (normalizedScore >= productivityAchievementData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '93%',
            contribution: `${percentagePoint}/${weight}pp ${normalizedScore >= productivityAchievementData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Vacancy Impact key metric
    if (vacancyImpactData) {
      const normalizedScore = (vacancyImpactData.normalized_score || 0) * 100; // Convert to percentage
      const percentagePoint = vacancyImpactData.percentage_point || 0;
      const weight = parseFloat((vacancyImpactData.weight || '0%').replace('%', ''));
      const variance = normalizedScore - (vacancyImpactData.target || 0);
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Vacancy Impact') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore.toFixed(1)}%`,
            target: '≥0%',
            variance: `${variance.toFixed(1)}%`,
            trend: (normalizedScore >= vacancyImpactData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '92%',
            contribution: `${percentagePoint.toFixed(1)}/${weight}pp ${normalizedScore >= vacancyImpactData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Volume Achievement key metric
    if (volumeAchievementData) {
      const normalizedScore = parseFloat(volumeAchievementData.normalized_score || '0');
      const percentagePoint = parseFloat(volumeAchievementData.percentage_point || '0');
      const weight = parseFloat((volumeAchievementData.weight || '0%').replace('%', ''));
      const branchTarget = parseFloat(volumeAchievementData.branch_target || '0');
      const totalDisbursement = parseFloat(volumeAchievementData.total_disbursement || '0');
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Volume Achievement') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore.toFixed(1)}%`,
            target: `≥${branchTarget.toLocaleString()}`,
            variance: `${totalDisbursement >= branchTarget ? '+' : ''}${(totalDisbursement - branchTarget).toLocaleString()}`,
            trend: (totalDisbursement >= branchTarget ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '88%',
            contribution: `${percentagePoint.toFixed(1)}/${weight}pp ${totalDisbursement >= branchTarget ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Portfolio Load Balance key metric
    if (loanPortfolioLoadData) {
      const normalizedScore = parseFloat(loanPortfolioLoadData.score || '0');
      const percentagePoint = loanPortfolioLoadData.percentage_point || 0;
      const weight = parseFloat((loanPortfolioLoadData.weight || '0%').replace('%', ''));
      const variance = normalizedScore - (loanPortfolioLoadData.target || 0);
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Portfolio Load Balance') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore.toFixed(1)}%`,
            target: '100%',
            variance: `${variance.toFixed(1)}%`,
            trend: (normalizedScore >= loanPortfolioLoadData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '94%',
            contribution: `${percentagePoint.toFixed(1)}/${weight}pp ${normalizedScore >= loanPortfolioLoadData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Loan Consultant Performance with Volume Achievement data
    if (volumeAchievementData) {
      const normalizedScore = parseFloat(volumeAchievementData.normalized_score || '0');
      const variance = normalizedScore - 100; // Target is 100% for normalized score
      
      updatedData = {
        ...updatedData,
        parameters: updatedData.parameters.map(param => {
          if (param.name === 'Loan Consultant Performance') {
            const trend = normalizedScore >= 90 ? '↑' : normalizedScore >= 70 ? '→' : '↓';
            const status = normalizedScore >= 90 ? 'good' : normalizedScore >= 70 ? 'warning' : 'critical';
            
            return {
              ...param,
              institutionalAvg: '--', // Hardcoded institutional average
              userLevelAvg: `${normalizedScore.toFixed(1)}%`,
              variance: `${variance.toFixed(1)}%`,
              varianceAbs: `${Math.abs(variance).toFixed(1)}pp`,
              trend: trend as '↑' | '↓' | '→',
              status: status as 'good' | 'warning' | 'critical'
            };
          }
          return param;
        })
      };
    }

      // Update Cash Position Score key metric
     if (cashPositionData) {
       const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || '0'));
       const score = calculateCashPositionScore(cashBalance, 'branch');
       
       keyMetrics = keyMetrics.map(metric => {
         if (metric.parameter === 'Cash Position Score') {
           return {
             ...metric,
             institutionalAvg: '--',
             currentPeriod: `${score.toFixed(1)}%`,
             target: 'K100,000',
             variance: `${(score - 100).toFixed(1)}%`,
             trend: (score >= 90 ? '↑' : '↓') as '↑' | '↓' | '→',
             provAvg: '90%',
             contribution: `${score.toFixed(1)} of 100pp`
           };
         }
         return metric;
       });
      }

      // Update Efficiency Ratio (CIR) key metric
      if (efficiencyRatioData) {
        const cirValue = parseFloat(efficiencyRatioData.CIR || '0') * 100;
        const target = parseFloat(efficiencyRatioData.target || '55');
        const weight = parseFloat((efficiencyRatioData.weight || '0%').replace('%', ''));
        const percentagePoint = parseFloat(efficiencyRatioData.percentage_point || '0');
        
        keyMetrics = keyMetrics.map(metric => {
          if (metric.parameter === 'Efficiency Ratio (CIR)') {
            return {
              ...metric,
              institutionalAvg: '--',
              currentPeriod: `${cirValue.toFixed(2)}%`,
              target: `≤${target}%`,
              variance: `${(cirValue - target).toFixed(2)}%`,
              trend: (cirValue <= target ? '↑' : '↓') as '↑' | '↓' | '→',
              provAvg: '90%',
              contribution: `${percentagePoint.toFixed(2)}/${weight}pp ${cirValue <= target ? '▲' : '▼'}`
            };
          }
          return metric;
        });
        
        updatedData = {
          ...updatedData,
          parameters: updatedData.parameters.map(param => {
            if (param.name === 'Efficiency Ratio (CIR)') {
              return {
                ...param,
                institutionalAvg: '--',
                userLevelAvg: `${cirValue.toFixed(2)}%`,
                target: `≤${target}%`,
                variance: `${(cirValue - target).toFixed(2)}%`,
                trend: (cirValue <= target ? '↑' : '↓') as '↑' | '↓' | '→',
                status: (cirValue <= target ? 'good' : 'warning') as 'good' | 'warning' | 'critical'
              };
            }
            return param;
          })
        };
      }

      // Update Growth Trajectory key metric
      if (growthTrajectoryData) {
        const momRevenue = parseFloat(String(growthTrajectoryData.mom_revenue || '0')) * 100;
        const target = 2.5;
        
        keyMetrics = keyMetrics.map(metric => {
          if (metric.parameter === 'Growth trajectory alignment') {
            return {
              ...metric,
              institutionalAvg: '--',
              currentPeriod: `${momRevenue.toFixed(2)}%`,
              target: '≥2.5%',
              variance: `${(momRevenue - target).toFixed(2)}%`,
              trend: (momRevenue >= target ? '↑' : '↓') as '↑' | '↓' | '→',
              provAvg: '90%',
              contribution: `${(momRevenue >= target ? 100 : 0).toFixed(0)} of 10pp ${momRevenue >= target ? '▲' : '▼'}`
            };
          }
          return metric;
        });
        
        updatedData = {
          ...updatedData,
          parameters: updatedData.parameters.map(param => {
            if (param.name === 'Growth trajectory alignment') {
              return {
                ...param,
                institutionalAvg: '--',
                userLevelAvg: `${momRevenue.toFixed(2)}%`,
                target: '≥2.5%',
                variance: `${(momRevenue - target).toFixed(2)}%`,
                trend: (momRevenue >= target ? '↑' : '↓') as '↑' | '↓' | '→',
                status: (momRevenue >= target ? 'good' : 'warning') as 'good' | 'warning' | 'critical'
              };
            }
            return param;
          })
        };
      }

      // Update Revenue Achievement key metric
      if (revenueAchievementsData) {
        const score = parseFloat(revenueAchievementsData.average_score || '0');
        const target = parseFloat(revenueAchievementsData.target || '100');
        const weight = parseFloat(String(revenueAchievementsData.weight || '0%').replace('%', ''));
        const percentagePoint = parseFloat(String(revenueAchievementsData.percentage_point || '0'));
        
        keyMetrics = keyMetrics.map(metric => {
          if (metric.parameter === 'Revenue achievement') {
            return {
              ...metric,
              institutionalAvg: '--',
              currentPeriod: `${score.toFixed(2)}%`,
              target: `≥${target}%`,
              variance: `${(score - target).toFixed(2)}%`,
              trend: (score >= target ? '↑' : '↓') as '↑' | '↓' | '→',
              provAvg: '90%',
              contribution: `${percentagePoint.toFixed(2)}/${weight}pp ${score >= target ? '▲' : '▼'}`
            };
          }
          return metric;
        });
        
        updatedData = {
          ...updatedData,
          parameters: updatedData.parameters.map(param => {
            if (param.name === 'Revenue achievement') {
              return {
                ...param,
                institutionalAvg: '--',
                userLevelAvg: `${score.toFixed(2)}%`,
                target: `≥${target}%`,
                variance: `${(score - target).toFixed(2)}%`,
                trend: (score >= target ? '↑' : '↓') as '↑' | '↓' | '→',
                status: (score >= target ? 'good' : score >= 70 ? 'warning' : 'critical') as 'good' | 'warning' | 'critical'
              };
            }
            return param;
          })
        };
      }

      // Update Profitability Contribution key metric
      if (profitabilityContributionData) {
        const scoreStr = profitabilityContributionData.score || profitabilityContributionData.average_score || '0';
        const score = parseFloat(scoreStr.replace('%', ''));
        const target = parseFloat(profitabilityContributionData.target || '100');
        const weightStr = profitabilityContributionData.weight || '0%';
        const weight = parseFloat(String(weightStr).replace('%', ''));
        const percentagePoint = parseFloat(String(profitabilityContributionData.percentage_point || '0'));
        
        keyMetrics = keyMetrics.map(metric => {
          if (metric.parameter === 'Profitability contribution') {
            return {
              ...metric,
              institutionalAvg: '--',
              currentPeriod: `${score.toFixed(2)}%`,
              target: '≥ institutional avg',
              variance: `${(score - target).toFixed(2)}%`,
              trend: (score >= target ? '↑' : '↓') as '↑' | '↓' | '→',
              provAvg: '90%',
              contribution: `${percentagePoint.toFixed(2)}/${weight}pp ${score >= target ? '▲' : '▼'}`
            };
          }
          return metric;
        });
        
        updatedData = {
          ...updatedData,
          parameters: updatedData.parameters.map(param => {
            if (param.name === 'Profitability contribution') {
              return {
                ...param,
                institutionalAvg: '--',
                userLevelAvg: `${score.toFixed(2)}%`,
                target: '≥ institutional avg',
                variance: `${(score - target).toFixed(2)}%`,
                trend: (score >= target ? '↑' : '↓') as '↑' | '↓' | '→',
                status: (score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical') as 'good' | 'warning' | 'critical'
              };
            }
            return param;
          })
        };
      }

      // Recalculate overall score based on updated parameters
      const overallScore = Math.round(
        updatedData.parameters.reduce((sum, param) => {
          const score = parseFloat(param.userLevelAvg.replace('%', ''));
          return sum + (isNaN(score) ? 0 : score);
        }, 0) / updatedData.parameters.length
      );

      // Mocked previous 3 months scores (fixed snapshots)
      const prevMonth1 = 68;
      const prevMonth2 = 62;
      const prevMonth3 = 65;
      const previousScore = Math.round((prevMonth1 + prevMonth2 + prevMonth3) / 3);
      const prevMonthScores = [
        { label: '3 months ago', score: prevMonth3 },
        { label: '2 months ago', score: prevMonth2 },
        { label: 'last month', score: prevMonth1 }
      ];

      // Recalculate overall institutional average
      const overallInstAvg = Math.round(
        updatedData.parameters.reduce((sum, param) => {
          const score = parseFloat(param.institutionalAvg.replace('%', ''));
          return sum + (isNaN(score) ? 0 : score);
        }, 0) / updatedData.parameters.length
      );

      return {
        ...updatedData,
        keyMetrics,
        overallScore,
        previousScore,
        prevMonthScores,
        overallInstAvg
      };
   }, [staffAdequacyData, productivityAchievementData, vacancyImpactData, volumeAchievementData, loanPortfolioLoadData, collectionEfficiencyData, efficiencyRatioData, growthTrajectoryData, longTermDelinquencyData, month1DefaultPerformanceData, month3RecoveryAchievementsData, portfolioQualityData, productDiversificationData, productRiskScoreData, rollRateControlData, yieldAchievementsData, revenueAchievementsData, profitabilityContributionData, cashPositionData]);

  return (
    <DashboardBase
      title="Branch Manager Dashboard"
      subtitle="Real-time branch performance and operations overview"
      userTier={userTier}
    >
      {/* Institutional Health Summary - Landing Page View */}
      <InstitutionalHealthSummary
        userLevel="branch"
        userLevelLabel="Branch View"
        parameters={summaryData.parameters}
        keyMetrics={summaryData.keyMetrics}
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        previousScore={summaryData.previousScore}
        prevMonthScores={summaryData.prevMonthScores}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
        staffAdequacyData={staffAdequacyData}
        productivityAchievementData={productivityAchievementData}
        vacancyImpactData={vacancyImpactData}
        volumeAchievementData={volumeAchievementData}
        loanPortfolioLoadData={loanPortfolioLoadData}
        collectionEfficiencyData={collectionEfficiencyData}
        efficiencyRatioData={efficiencyRatioData}
        growthTrajectoryData={growthTrajectoryData}
        longTermDelinquencyData={longTermDelinquencyData}
        month1DefaultPerformanceData={month1DefaultPerformanceData}
        month3RecoveryAchievementsData={month3RecoveryAchievementsData}
        portfolioQualityData={portfolioQualityData}
        productDiversificationData={productDiversificationData}
        productRiskScoreData={productRiskScoreData}
        rollRateControlData={rollRateControlData}
        yieldAchievementsData={yieldAchievementsData}
         cashPositionData={cashPositionData}
         isLoading={isLoading || isKpiLoading || isStaffAdequacyLoading || isProductivityLoading || isVacancyLoading || isVolumeLoading || isLoanPortfolioLoading || isCollectionEfficiencyLoading || isEfficiencyRatioLoading || isGrowthTrajectoryLoading || isLongTermDelinquencyLoading || isMonth1DefaultPerformanceLoading || isMonth3RecoveryAchievementsLoading || isPortfolioQualityLoading || isProductDiversificationLoading || isProductRiskScoreLoading || isRollRateControlLoading || isYieldAchievementsLoading || isCashPositionLoading}
        />


    </DashboardBase>
  );
}
