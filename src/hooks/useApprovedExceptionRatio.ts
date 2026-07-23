'use client';

import { useState, useEffect } from 'react';
import { fetchApprovedExceptionRatio, ApprovedExceptionRatioData as ServiceData } from '@/services/ApprovedExceptionRatioService';

export interface ApprovedExceptionRatioData {
  score: number;
  average_score: number;
  percentage_point: number;
  weight: string;
  totalFullPayments: number;
  totalNewLoans: number;
  totalCashBalance: number;
  totalExcess: number;
  approvedExcess: number;
}

export function useApprovedExceptionRatio(filters?: {
  office_id?: number;
  province_id?: number;
  district_id?: number;
  start_date?: string;
  end_date?: string;
}) {
  const [data, setData] = useState<ApprovedExceptionRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!filters?.office_id) throw new Error('office_id is required');

        const serviceData: ServiceData = await fetchApprovedExceptionRatio(filters.office_id);

        const data: ApprovedExceptionRatioData = {
          score: parseFloat(serviceData.score || '0'),
              average_score: parseFloat(String(serviceData.average_score ?? 0)),
          percentage_point: parseFloat(serviceData.percentage_point || '0'),
          weight: serviceData.weight || '10%',
          totalFullPayments: serviceData.approvedExcess || 0,
          totalNewLoans: serviceData.totalExcess || 0,
          totalCashBalance: serviceData.totalCashBalance || 0,
          totalExcess: serviceData.totalExcess || 0,
          approvedExcess: serviceData.approvedExcess || 0,
        };

        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch approved exception ratio');
      } finally {
        setIsLoading(false);
      }
    };

    if (filters?.office_id) {
      fetchData();
    }
  }, [filters?.office_id]);

  return {
    data,
    isLoading,
    error
  };
}
