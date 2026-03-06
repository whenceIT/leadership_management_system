'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialLoanPortfolioLoad, LoanPortfolioLoadData } from '@/services/LoanPortfolioLoadService';

export function useProvincialLoanPortfolioLoad(provinceId: number) {
  const [data, setData] = useState<LoanPortfolioLoadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialLoanPortfolioLoad(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial loan portfolio load');
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
