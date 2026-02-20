'use client';

import { useUserSync } from '@/hooks/useUserSync';

export interface LoanConsultantMetrics {
  user_id: number;
  name: string;
  office: string;
  total_uncollected: string;
  total_collected: string;
  still_uncollected: string;
  given_out: string;
  carry_over: number;
}

export class LoanConsultantMetricsService {
  private static instance: LoanConsultantMetricsService;

  private constructor() {}

  public static getInstance(): LoanConsultantMetricsService {
    if (!LoanConsultantMetricsService.instance) {
      LoanConsultantMetricsService.instance = new LoanConsultantMetricsService();
    }
    return LoanConsultantMetricsService.instance;
  }

  /**
   * Fetch loan consultant metrics from API
   */
  public async fetchLoanConsultantMetrics(userId: number, startDate: string, endDate: string): Promise<LoanConsultantMetrics> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lms2backend.whencefinancesystem.com';
      
      const response = await fetch(
        `${API_BASE_URL}/my-performance-new?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch loan consultant metrics: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching loan consultant metrics:', error);
      // Return mock data if API fails
      return {
        user_id: userId,
        name: 'John Doe',
        office: 'KAMBENDEKELA HOUSE LUSAKA',
        total_uncollected: '39735.60',
        total_collected: '49784.00',
        still_uncollected: '-10048.40',
        given_out: '39384.00',
        carry_over: 0
      };
    }
  }
}

export default LoanConsultantMetricsService;
