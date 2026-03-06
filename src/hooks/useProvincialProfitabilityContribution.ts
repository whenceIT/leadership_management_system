'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialProfitabilityContribution, ProfitabilityContributionData } from '@/services/ProfitabilityContributionService';

export function useProvincialProfitabilityContribution(provinceId: number) {
  const [data, setData] = useState<ProfitabilityContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialProfitabilityContribution(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial profitability contribution');
      } finally {
        setIsLoading(false);
      }
    };

    if (provinceId > 0) {
      fetchData();
    }
  }, [provinceId]);

  return {
    data,
    isLoading,
    error
  };
}
