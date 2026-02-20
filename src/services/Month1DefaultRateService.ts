'use client';

import { useUserPosition } from '@/hooks/useUserPosition';
import { useUserTier } from '@/hooks/useUserTier';
import { useUserSync } from '@/hooks/useUserSync';
import { useUserKPI } from '@/hooks/useUserKPI';
import { useOffice } from '@/hooks/useOffice';

export interface Month1DefaultRateResult {
  office_id: number;
  period: {
    month: number;
    year: number;
  };
  total_loans_disbursed: number;
  total_disbursement_amount: number;
  month_1_defaults: number;
  default_amount: number;
  default_rate: number;
  default_rate_percentage: string;
  comparison: {
    previous_month_rate: number;
    same_month_last_year: number;
    branch_average: number;
  };
  risk_assessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  };
  default_breakdown: {
    by_loan_product: {
      product_id: number;
      product_name: string;
      defaults: number;
      default_rate: number;
    }[];
    by_loan_officer: {
      user_id: number;
      officer_name: string;
      defaults: number;
      default_rate: number;
    }[];
  };
}

export class Month1DefaultRateService {
  private static instance: Month1DefaultRateService;

  private constructor() {}

  public static getInstance(): Month1DefaultRateService {
    if (!Month1DefaultRateService.instance) {
      Month1DefaultRateService.instance = new Month1DefaultRateService();
    }
    return Month1DefaultRateService.instance;
  }

  /**
   * Calculate Month-1 Default Rate
   */
  public async calculateMonth1DefaultRate(
    officeId: number, 
    month: number, 
    year: number
  ): Promise<Month1DefaultRateResult> {
    try {
      // Mock data - will be replaced with real API calls
      const totalLoansDisbursed = 100;
      const month1Defaults = 5;
      const totalDisbursementAmount = 250000;
      const defaultAmount = 12500;
      
      const defaultRate = totalLoansDisbursed > 0 ? (month1Defaults / totalLoansDisbursed) * 100 : 0;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let recommendation = '';
      
      if (defaultRate < 2) {
        riskLevel = 'low';
        recommendation = 'Continue with current practices. Risk level is acceptable.';
      } else if (defaultRate < 5) {
        riskLevel = 'medium';
        recommendation = 'Monitor closely. Consider additional training for loan officers.';
      } else if (defaultRate < 10) {
        riskLevel = 'high';
        recommendation = 'Implement immediate corrective actions. Review underwriting standards.';
      } else {
        riskLevel = 'critical';
        recommendation = 'Urgent action required. Suspend new loan disbursements and conduct full audit.';
      }

      return {
        office_id: officeId,
        period: {
          month,
          year
        },
        total_loans_disbursed: totalLoansDisbursed,
        total_disbursement_amount: totalDisbursementAmount,
        month_1_defaults: month1Defaults,
        default_amount: defaultAmount,
        default_rate: defaultRate,
        default_rate_percentage: `${defaultRate.toFixed(1)}%`,
        comparison: {
          previous_month_rate: 4.5,
          same_month_last_year: 6.2,
          branch_average: 4.8
        },
        risk_assessment: {
          level: riskLevel,
          recommendation: recommendation
        },
        default_breakdown: {
          by_loan_product: [
            {
              product_id: 1,
              product_name: 'Personal Loan',
              defaults: 3,
              default_rate: 3.0
            },
            {
              product_id: 2,
              product_name: 'Business Loan',
              defaults: 2,
              default_rate: 5.0
            }
          ],
          by_loan_officer: [
            {
              user_id: 1,
              officer_name: 'John Doe',
              defaults: 2,
              default_rate: 4.0
            },
            {
              user_id: 2,
              officer_name: 'Jane Smith',
              defaults: 3,
              default_rate: 6.0
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error calculating Month-1 Default Rate:', error);
      throw error;
    }
  }
}

export default Month1DefaultRateService;
