'use client';

import { useUserPosition } from '@/hooks/useUserPosition';
import { useUserTier } from '@/hooks/useUserTier';
import { useUserSync } from '@/hooks/useUserSync';
import { useUserKPI } from '@/hooks/useUserKPI';
import { useOffice } from '@/hooks/useOffice';

export interface StaffProductivityMetrics {
  user_id: number;
  user_name: string;
  office_id: number;
  office_name: string;
  period: {
    start: Date;
    end: Date;
  };
  loan_metrics: {
    total_loans_processed: number;
    loans_disbursed: number;
    loans_pending: number;
    loans_declined: number;
    average_processing_time_days: number;
    disbursement_amount_total: number;
    average_loan_size: number;
  };
  collection_metrics: {
    total_collections: number;
    collection_rate: number;
    arrears_cases: number;
    arrears_amount: number;
    recovery_rate: number;
  };
  client_metrics: {
    total_clients_assigned: number;
    active_clients: number;
    new_clients_period: number;
    client_retention_rate: number;
  };
  productivity_score: number;
  productivity_grade: string;
}

export class StaffProductivityMetricsService {
  private static instance: StaffProductivityMetricsService;

  private constructor() {}

  public static getInstance(): StaffProductivityMetricsService {
    if (!StaffProductivityMetricsService.instance) {
      StaffProductivityMetricsService.instance = new StaffProductivityMetricsService();
    }
    return StaffProductivityMetricsService.instance;
  }

  /**
   * Calculate staff productivity metrics
   */
  public async calculateStaffProductivity(
    userId: number, 
    officeId: number, 
    periodStart: Date, 
    periodEnd: Date
  ): Promise<StaffProductivityMetrics> {
    try {
      // Mock data - will be replaced with real API calls
      const loanMetrics = {
        total_loans_processed: 100,
        loans_disbursed: 80,
        loans_pending: 15,
        loans_declined: 5,
        average_processing_time_days: 3.5,
        disbursement_amount_total: 200000,
        average_loan_size: 2500
      };

      const collectionMetrics = {
        total_collections: 150000,
        collection_rate: 95,
        arrears_cases: 5,
        arrears_amount: 7500,
        recovery_rate: 90
      };

      const clientMetrics = {
        total_clients_assigned: 200,
        active_clients: 180,
        new_clients_period: 20,
        client_retention_rate: 90
      };

      // Calculate productivity score (weighted)
      const loanProcessingScore = 80; // 30% weight
      const collectionPerformanceScore = 95; // 40% weight
      const clientManagementScore = 90; // 30% weight
      
      const productivityScore = (loanProcessingScore * 0.3) + (collectionPerformanceScore * 0.4) + (clientManagementScore * 0.3);

      // Determine productivity grade
      let productivityGrade = 'F';
      if (productivityScore >= 90) {
        productivityGrade = 'A';
      } else if (productivityScore >= 80) {
        productivityGrade = 'B';
      } else if (productivityScore >= 70) {
        productivityGrade = 'C';
      } else if (productivityScore >= 60) {
        productivityGrade = 'D';
      }

      return {
        user_id: userId,
        user_name: 'John Doe', // Will be replaced with actual user name
        office_id: officeId,
        office_name: 'ZIMCO HOUSE LUSAKA', // Will be replaced with actual office name
        period: {
          start: periodStart,
          end: periodEnd
        },
        loan_metrics: loanMetrics,
        collection_metrics: collectionMetrics,
        client_metrics: clientMetrics,
        productivity_score: productivityScore,
        productivity_grade: productivityGrade
      };
    } catch (error) {
      console.error('Error calculating staff productivity metrics:', error);
      throw error;
    }
  }
}

export default StaffProductivityMetricsService;
