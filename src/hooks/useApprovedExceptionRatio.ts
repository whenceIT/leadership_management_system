'use client';

import { useState, useEffect } from 'react';

export interface ApprovedExceptionRatioData {
  score: number;
  average_score: number;
  percentage_point: number;
  weight: string;
  totalFullPayments: number;
  totalNewLoans: number;
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
        const queryParams = new URLSearchParams();
        if (filters?.office_id) queryParams.append('office_id', filters.office_id.toString());
        if (filters?.province_id) queryParams.append('province_id', filters.province_id.toString());
        if (filters?.district_id) queryParams.append('district_id', filters.district_id.toString());
        if (filters?.start_date) queryParams.append('start_date', filters.start_date);
        if (filters?.end_date) queryParams.append('end_date', filters.end_date);

        const url = `https://smartbackend.whencefinancesystem.com/api/kpi-scores/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        if (!result.success) throw new Error('API returned success false');

        const apiData = result.data;
        const totalFullPayments = apiData.totalFullPayments;
        const totalNewLoans = apiData.totalNewLoans;
        const score = totalNewLoans > 0 ? (totalFullPayments / totalNewLoans) * 100 : 0;

        const data: ApprovedExceptionRatioData = {
          score,
          average_score: score,
          percentage_point: score,
          weight: '10%',
          totalFullPayments,
          totalNewLoans,
        };

        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch approved exception ratio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters?.office_id, filters?.province_id, filters?.district_id, filters?.start_date, filters?.end_date]);

  return {
    data,
    isLoading,
    error
  };
}
