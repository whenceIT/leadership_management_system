'use client';

import { useUserPosition } from '@/hooks/useUserPosition';
import { useUserTier } from '@/hooks/useUserTier';
import { useUserSync } from '@/hooks/useUserSync';
import { useUserKPI } from '@/hooks/useUserKPI';
import { useOffice } from '@/hooks/useOffice';

export interface TalentPipelineStrengthResult {
  office_id: number | null; // null for organization-wide
  period: {
    start_date: Date;
    end_date: Date;
  };
  pipeline_metrics: {
    total_staff: number;
    by_tier: {
      tier_id: number;
      tier_name: string;
      count: number;
      percentage: number;
    }[];
    tier_progression: {
      user_id: number;
      user_name: string;
      previous_tier: string;
      current_tier: string;
      progression_date: Date;
      time_to_progress: number; // days
    }[];
  };
  performance_metrics: {
    high_performers: number; // KPI score > 80%
    average_performers: number; // KPI score 50-80%
    low_performers: number; // KPI score < 50%
    average_kpi_score: number;
  };
  retention_metrics: {
    new_hires: number;
    departures: number;
    retention_rate: number;
    average_tenure_months: number;
  };
  pipeline_strength_score: number;
  pipeline_health: 'strong' | 'moderate' | 'weak';
  development_needs: {
    area: string;
    staff_count: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  succession_readiness: {
    position: string;
    ready_now: number;
    ready_1_2_years: number;
    ready_3_5_years: number;
  }[];
}

export class TalentPipelineStrengthService {
  private static instance: TalentPipelineStrengthService;

  private constructor() {}

  public static getInstance(): TalentPipelineStrengthService {
    if (!TalentPipelineStrengthService.instance) {
      TalentPipelineStrengthService.instance = new TalentPipelineStrengthService();
    }
    return TalentPipelineStrengthService.instance;
  }

  /**
   * Calculate talent pipeline strength for an office or organization
   */
  public async calculateTalentPipelineStrength(
    officeId: number | null, 
    periodStart: Date, 
    periodEnd: Date
  ): Promise<TalentPipelineStrengthResult> {
    try {
      // Mock data - will be replaced with real API calls
      const pipelineMetrics = {
        total_staff: 100,
        by_tier: [
          {
            tier_id: 1,
            tier_name: 'Base',
            count: 40,
            percentage: 40
          },
          {
            tier_id: 2,
            tier_name: 'K50K+',
            count: 30,
            percentage: 30
          },
          {
            tier_id: 3,
            tier_name: 'K80K+',
            count: 20,
            percentage: 20
          },
          {
            tier_id: 4,
            tier_name: 'K120K+',
            count: 10,
            percentage: 10
          }
        ],
        tier_progression: [
          {
            user_id: 1,
            user_name: 'John Doe',
            previous_tier: 'K50K+',
            current_tier: 'K80K+',
            progression_date: new Date('2023-01-15'),
            time_to_progress: 365
          },
          {
            user_id: 2,
            user_name: 'Jane Smith',
            previous_tier: 'Base',
            current_tier: 'K50K+',
            progression_date: new Date('2023-02-20'),
            time_to_progress: 180
          }
        ]
      };

      const performanceMetrics = {
        high_performers: 30,
        average_performers: 50,
        low_performers: 20,
        average_kpi_score: 75
      };

      const retentionMetrics = {
        new_hires: 10,
        departures: 5,
        retention_rate: 95,
        average_tenure_months: 24
      };

      // Calculate pipeline strength score
      const tierDistributionScore = 80; // 20% weight
      const performanceScore = 75; // 30% weight
      const retentionScore = 95; // 25% weight
      const progressionScore = 70; // 25% weight

      const pipelineStrengthScore = (tierDistributionScore * 0.2) + (performanceScore * 0.3) + (retentionScore * 0.25) + (progressionScore * 0.25);

      // Determine pipeline health
      let pipelineHealth: 'strong' | 'moderate' | 'weak' = 'weak';
      if (pipelineStrengthScore >= 75) {
        pipelineHealth = 'strong';
      } else if (pipelineStrengthScore >= 50) {
        pipelineHealth = 'moderate';
      }

      return {
        office_id: officeId,
        period: {
          start_date: periodStart,
          end_date: periodEnd
        },
        pipeline_metrics: pipelineMetrics,
        performance_metrics: performanceMetrics,
        retention_metrics: retentionMetrics,
        pipeline_strength_score: pipelineStrengthScore,
        pipeline_health: pipelineHealth,
        development_needs: [
          {
            area: 'Sales Techniques',
            staff_count: 25,
            priority: 'high'
          },
          {
            area: 'Customer Service',
            staff_count: 15,
            priority: 'medium'
          },
          {
            area: 'Product Knowledge',
            staff_count: 10,
            priority: 'low'
          }
        ],
        succession_readiness: [
          {
            position: 'Branch Manager',
            ready_now: 2,
            ready_1_2_years: 5,
            ready_3_5_years: 8
          },
          {
            position: 'Loan Consultant',
            ready_now: 5,
            ready_1_2_years: 10,
            ready_3_5_years: 15
          }
        ]
      };
    } catch (error) {
      console.error('Error calculating talent pipeline strength:', error);
      throw error;
    }
  }
}

export default TalentPipelineStrengthService;
