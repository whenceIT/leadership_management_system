'use client';

import { useState, useEffect } from 'react';
import { 
  fetchPortfolioQuality, 
  fetchProvincialPortfolioQuality, 
  PortfolioQualityData 
} from '@/services/PortfolioQualityService';

export function usePortfolioQuality(branchId: number) {
  const [data, setData] = useState<PortfolioQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchPortfolioQuality(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio quality');
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

export function useProvincialPortfolioQuality(provinceId: number) {
  const [data, setData] = useState<PortfolioQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialPortfolioQuality(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial portfolio quality');
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
