'use client';

import { useState, useEffect } from 'react';
import { fetchProfitabilityContribution, ProfitabilityContributionData } from '@/services/ProfitabilityContributionService';

export function useProfitabilityContribution(branchId: number) {
  const [data, setData] = useState<ProfitabilityContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProfitabilityContribution(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profitability contribution');
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId > 0) {
      fetchData();
    }
  }, [branchId]);

  return {
    data,
    isLoading,
    error
  };
}