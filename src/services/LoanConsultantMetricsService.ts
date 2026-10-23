'use client';

import { useUserSync } from '@/hooks/useUserSync';

export interface LoanConsultantMetrics {
  user_id: number;
  name: string;
  total_uncollected: string;
  total_collected: string;
  still_uncollected: string;
  given_out: string;
  pdua: string;
  carry_over: number;
  target_met_current: number;
  target_history: number[];
  cycle_end_on: number;
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
    * Fetch loan consultant metrics by office from API
    */
  public async fetchConsultantsPerformanceByOffice(officeId: number | undefined, startDate: string, endDate: string): Promise<LoanConsultantMetrics[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lms2backend.whencefinancesystem.com';

      let userJobPosition: number | undefined;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('thisUser');
          if (stored) userJobPosition = JSON.parse(stored)?.job_position;
        } catch {}
      }

      const params = new URLSearchParams();
      if (userJobPosition !== 20 && officeId && officeId > 0) params.set('office_id', String(officeId));
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);

      const response = await fetch(
        `${API_BASE_URL}/consultants-performance-by-office?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch consultants performance: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching consultants performance:', error);
      // Return empty array if API fails
      return [];
    }
  }

  /**
    * Fetch loan consultant metrics from API (legacy method)
    */
  public async fetchLoanConsultantMetrics(userId: number, startDate: string, endDate: string): Promise<LoanConsultantMetrics> {
    // This method is kept for backward compatibility but should be replaced with fetchConsultantsPerformanceByOffice
    throw new Error('Use fetchConsultantsPerformanceByOffice instead');
  }
}

export default LoanConsultantMetricsService;
