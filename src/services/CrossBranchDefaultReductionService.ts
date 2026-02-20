'use client';

import { useUserPosition } from '@/hooks/useUserPosition';
import { useUserTier } from '@/hooks/useUserTier';
import { useUserSync } from '@/hooks/useUserSync';
import { useUserKPI } from '@/hooks/useUserKPI';
import { useOffice } from '@/hooks/useOffice';

export interface CrossBranchDefaultReductionResult {
  period: {
    start_date: Date;
    end_date: Date;
  };
  branches: {
    office_id: number;
    office_name: string;
    province: string;
    metrics: {
      starting_npl_count: number;
      starting_npl_amount: number;
      current_npl_count: number;
      current_npl_amount: number;
      recovered_count: number;
      recovered_amount: number;
      reduction_rate: number;
      new_defaults_count: number;
      new_defaults_amount: number;
    };
    ranking: {
      overall: number;
      by_reduction: number;
      by_recovery: number;
    };
    trend: 'improving' | 'stable' | 'declining';
  }[];
  summary: {
    total_npl_reduction: number;
    average_reduction_rate: number;
    best_performing_branch: string;
    needs_attention: string[];
  };
  recommendations: {
    branch_id: number;
    branch_name: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export class CrossBranchDefaultReductionService {
  private static instance: CrossBranchDefaultReductionService;

  private constructor() {}

  public static getInstance(): CrossBranchDefaultReductionService {
    if (!CrossBranchDefaultReductionService.instance) {
      CrossBranchDefaultReductionService.instance = new CrossBranchDefaultReductionService();
    }
    return CrossBranchDefaultReductionService.instance;
  }

  /**
   * Calculate cross-branch default reduction performance
   */
  public async calculateCrossBranchDefaultReduction(
    periodStart: Date, 
    periodEnd: Date, 
    provinceId?: number
  ): Promise<CrossBranchDefaultReductionResult> {
    try {
      // Mock data - will be replaced with real API calls
      const branches: CrossBranchDefaultReductionResult['branches'] = [
        {
          office_id: 1,
          office_name: 'ZIMCO HOUSE LUSAKA',
          province: 'Lusaka',
          metrics: {
            starting_npl_count: 100,
            starting_npl_amount: 500000,
            current_npl_count: 80,
            current_npl_amount: 400000,
            recovered_count: 25,
            recovered_amount: 125000,
            reduction_rate: 20,
            new_defaults_count: 5,
            new_defaults_amount: 25000
          },
          ranking: {
            overall: 1,
            by_reduction: 1,
            by_recovery: 2
          },
          trend: 'improving'
        },
        {
          office_id: 5,
          office_name: 'WHENCE KITWE BRANCH',
          province: 'Copperbelt',
          metrics: {
            starting_npl_count: 120,
            starting_npl_amount: 600000,
            current_npl_count: 110,
            current_npl_amount: 550000,
            recovered_count: 15,
            recovered_amount: 75000,
            reduction_rate: 8.3,
            new_defaults_count: 5,
            new_defaults_amount: 25000
          },
          ranking: {
            overall: 2,
            by_reduction: 2,
            by_recovery: 3
          },
          trend: 'stable'
        },
        {
          office_id: 4,
          office_name: 'SOLWEZI  HQ BRANCH',
          province: 'North-Western',
          metrics: {
            starting_npl_count: 90,
            starting_npl_amount: 450000,
            current_npl_count: 100,
            current_npl_amount: 500000,
            recovered_count: 10,
            recovered_amount: 50000,
            reduction_rate: -11.1,
            new_defaults_count: 20,
            new_defaults_amount: 100000
          },
          ranking: {
            overall: 3,
            by_reduction: 3,
            by_recovery: 1
          },
          trend: 'declining'
        }
      ];

      // Filter branches by province if provinceId is provided
      const filteredBranches = provinceId 
        ? branches.filter(branch => branch.office_id === provinceId)
        : branches;

      // Calculate summary
      const totalNPLReduction = filteredBranches.reduce((sum, branch) => sum + branch.metrics.reduction_rate, 0);
      const averageReductionRate = totalNPLReduction / filteredBranches.length;
      
      const bestPerformingBranch = filteredBranches.reduce((best, branch) => 
        branch.metrics.reduction_rate > best.metrics.reduction_rate ? branch : best
      );

      const needsAttention = filteredBranches
        .filter(branch => branch.metrics.reduction_rate < 0)
        .map(branch => branch.office_name);

      // Generate recommendations
      const recommendations = filteredBranches.map(branch => {
        let recommendation = '';
        let priority: 'high' | 'medium' | 'low' = 'low';

        if (branch.metrics.reduction_rate < 0) {
          recommendation = 'Urgent action required. Review underwriting and collection practices.';
          priority = 'high';
        } else if (branch.metrics.reduction_rate < 10) {
          recommendation = 'Need to improve default reduction efforts. Consider additional training.';
          priority = 'medium';
        } else {
          recommendation = 'Continue with current practices. Performance is good.';
          priority = 'low';
        }

        return {
          branch_id: branch.office_id,
          branch_name: branch.office_name,
          recommendation: recommendation,
          priority: priority
        };
      });

      return {
        period: {
          start_date: periodStart,
          end_date: periodEnd
        },
        branches: filteredBranches,
        summary: {
          total_npl_reduction: totalNPLReduction,
          average_reduction_rate: averageReductionRate,
          best_performing_branch: bestPerformingBranch.office_name,
          needs_attention: needsAttention
        },
        recommendations: recommendations
      };
    } catch (error) {
      console.error('Error calculating cross-branch default reduction:', error);
      throw error;
    }
  }
}

export default CrossBranchDefaultReductionService;
