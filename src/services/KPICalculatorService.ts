'use client';

import { useUserPosition } from '@/hooks/useUserPosition';
import { useUserKPI } from '@/hooks/useUserKPI';

export interface KPICalculationResult {
  user_id: number;
  position_id: number;
  total_score: number;
  max_possible_score: number;
  percentage_score: number;
  weighted_score: number;
  kpi_breakdown: {
    kpi_id: number;
    kpi_name: string;
    category: string;
    target: number;
    actual: number;
    score: number;
    weight: number;
    weighted_contribution: number;
  }[];
  calculated_at: Date;
}

export class KPICalculatorService {
  private static instance: KPICalculatorService;

  private constructor() {}

  public static getInstance(): KPICalculatorService {
    if (!KPICalculatorService.instance) {
      KPICalculatorService.instance = new KPICalculatorService();
    }
    return KPICalculatorService.instance;
  }

  /**
   * Calculate KPI scores for a user (currently not used anywhere)
   */
  public async calculateKPIScores(userId: number, positionId: number): Promise<KPICalculationResult> {
    try {
      // Get KPI scores from useUserKPI
      const { processedKPIs } = useUserKPI();

      // Calculate scores
      const kpiBreakdown = processedKPIs.map(kpi => {
        const score = this.calculateKPIScore(kpi);
        const weightedContribution = score * (kpi.weight / 100);
        
        return {
          kpi_id: 0, // Placeholder
          kpi_name: kpi.name,
          category: kpi.category,
          target: kpi.target,
          actual: kpi.value,
          score,
          weight: kpi.weight,
          weighted_contribution: weightedContribution
        };
      });

      // Calculate total scores
      const totalScore = kpiBreakdown.reduce((sum, kpi) => sum + kpi.score, 0);
      const maxPossibleScore = kpiBreakdown.length * 100;
      const percentageScore = (totalScore / maxPossibleScore) * 100;
      const weightedScore = kpiBreakdown.reduce((sum, kpi) => sum + kpi.weighted_contribution, 0);

      return {
        user_id: userId,
        position_id: positionId,
        total_score: totalScore,
        max_possible_score: maxPossibleScore,
        percentage_score: percentageScore,
        weighted_score: weightedScore,
        kpi_breakdown: kpiBreakdown,
        calculated_at: new Date()
      };
    } catch (error) {
      console.error('Error calculating KPI scores:', error);
      throw error;
    }
  }

  /**
   * Calculate individual KPI score
   */
  private calculateKPIScore(kpi: any): number {
    let percentageAchieved = 0;
    if (kpi.target > 0) {
      percentageAchieved = (kpi.value / kpi.target) * 100;
    }

    // Apply scoring logic based on scoring type
    let score = percentageAchieved;

    // Categories where lower is better
    const lowerIsBetterCategories = ['default', 'overdue', 'late', 'fail', 'churn'];
    const isLowerBetter = lowerIsBetterCategories.some(cat => 
      kpi.name.toLowerCase().includes(cat) || 
      kpi.category?.toLowerCase().includes(cat)
    );

    if (isLowerBetter) {
      // For metrics where lower is better
      if (kpi.value <= kpi.target) {
        score = 100;
      } else {
        score = Math.max(0, 100 - ((kpi.value - kpi.target) / kpi.target) * 100);
      }
    } else {
      // For metrics where higher is better
      score = Math.min(100, percentageAchieved);
    }

    return score;
  }

  public async markscore(userId: number, positionId: number, kpi_name: string): Promise<any[]> {
    const results: any[] = [];

    // Branch Manager
    if (positionId === 5) {
        // Call all Branch Manager KPI score endpoints
        const endpoints = [
            '/api/kpi-scores/month1-default-rate',
            '/api/kpi-scores/monthly-disbursement',
            '/api/kpi-scores/lcs-at-k50k-tier',
            '/api/kpi-scores/branch-net-contribution'
        ];

        // Call each endpoint in parallel
        const promises = endpoints.map(async (endpoint) => {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        positionId
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    results.push(data);
                } else {
                    console.error(`Failed to fetch ${endpoint}:`, response.statusText);
                }
            } catch (error) {
                console.error(`Error fetching ${endpoint}:`, error);
            }
        });

        // Wait for all requests to complete
        await Promise.all(promises);
    }

    return results;
  }
}

export default KPICalculatorService;
