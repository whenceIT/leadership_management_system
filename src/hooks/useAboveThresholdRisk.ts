'use client';

import { useState, useEffect } from 'react';
import { fetchAboveThresholdRisk, AboveThresholdRiskData as ServiceData } from '@/services/AboveThresholdRiskService';

export interface AboveThresholdRiskData {
  score: number;
  average_score: number;
  percentage_point: number;
  totalCashBalance: number;
  unapprovedExcess: number;
  approvedExcess?: number;
}

export function useAboveThresholdRisk(filters?: {
  office_id?: number;
  province_id?: number;
  district_id?: number;
  start_date?: string;
  end_date?: string;
}) {
  const [data, setData] = useState<AboveThresholdRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!filters?.office_id) throw new Error('office_id is required');

        const serviceData: ServiceData = await fetchAboveThresholdRisk(filters.office_id);

        const data: AboveThresholdRiskData = {
          score: parseFloat(serviceData.score || '0'),
          average_score: parseFloat(serviceData.average_score || '0'),
          percentage_point: parseFloat(serviceData.percentage_points || '0'),
          totalCashBalance: serviceData.totalCashBalance || 0,
          unapprovedExcess: serviceData.unapprovedExcess || 0,
          approvedExcess: serviceData.approvedExcess || 0,
        };

        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch above threshold risk');
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
