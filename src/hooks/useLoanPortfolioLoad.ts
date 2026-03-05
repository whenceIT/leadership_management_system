'use client';

import { useState, useEffect } from 'react';
import { fetchLoanPortfolioLoad, LoanPortfolioLoadData } from '@/services/LoanPortfolioLoadService';

export function useLoanPortfolioLoad(branchId: number) {
  const [data, setData] = useState<LoanPortfolioLoadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchLoanPortfolioLoad(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch loan portfolio load');
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
