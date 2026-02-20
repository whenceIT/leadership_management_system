'use client';

import { useState, useEffect, useCallback } from 'react';

interface LoanConsultantStats {
  new_applications: number;
  under_review: number;
  approved: number;
  disbursed: number;
  total_loans: number;
  pending_loans: number;
  declined: number;
}

interface LoanConsultantStatsResponse {
  success: boolean;
  data: LoanConsultantStats;
}

interface CircleStats {
  current: LoanConsultantStats | null;
  previous: LoanConsultantStats | null;
}

export function useLoanConsultantStats() {
  const [data, setData] = useState<LoanConsultantStats | null>(null);
  const [circleStats, setCircleStats] = useState<CircleStats>({
    current: null,
    previous: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'https://smartbackend.whencefinancesystem.com';

  // Calculate circle date ranges (24th of previous month to 24th of current month)
  const getCircleDateRanges = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Current circle
    let currentCircleStart: Date;
    let currentCircleEnd: Date;

    if (currentDay >= 24) {
      // We're past the 24th, so current circle is 24th of this month to 24th of next month
      currentCircleStart = new Date(currentYear, currentMonth, 24);
      currentCircleEnd = new Date(currentYear, currentMonth + 1, 24);
    } else {
      // We're before the 24th, so current circle is 24th of last month to 24th of this month
      currentCircleStart = new Date(currentYear, currentMonth - 1, 24);
      currentCircleEnd = new Date(currentYear, currentMonth, 24);
    }

    // Previous circle (one month before current circle)
    const previousCircleStart = new Date(currentCircleStart);
    previousCircleStart.setMonth(previousCircleStart.getMonth() - 1);
    
    const previousCircleEnd = new Date(currentCircleEnd);
    previousCircleEnd.setMonth(previousCircleEnd.getMonth() - 1);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      current: {
        start_date: formatDate(currentCircleStart),
        end_date: formatDate(currentCircleEnd)
      },
      previous: {
        start_date: formatDate(previousCircleStart),
        end_date: formatDate(previousCircleEnd)
      }
    };
  };

  const getUserId = (): number => {
    if (typeof window === 'undefined') {
      return 0;
    }
    
    try {
      const storedUser = localStorage.getItem('thisUser');
      if (!storedUser) {
        return 0;
      }
      
      const user = JSON.parse(storedUser);
      return user.id || 0;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      return 0;
    }
  };

  const fetchAllStats = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(
      `${API_BASE_URL}/loan-consultant-stats?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch all time stats');
    }

    const result: LoanConsultantStatsResponse = await response.json();

    if (result.success) {
      setData(result.data);
      return result.data;
    } else {
      throw new Error('Failed to get all time stats');
    }
  }, []);

  const fetchCurrentCircleStats = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const dateRanges = getCircleDateRanges();
    const { start_date, end_date } = dateRanges.current;

    const response = await fetch(
      `${API_BASE_URL}/loan-consultant-stats?user_id=${userId}&start_date=${start_date}&end_date=${end_date}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current circle stats');
    }

    const result: LoanConsultantStatsResponse = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error('Failed to get current circle stats');
    }
  }, []);

  const fetchPreviousCircleStats = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const dateRanges = getCircleDateRanges();
    const { start_date, end_date } = dateRanges.previous;

    const response = await fetch(
      `${API_BASE_URL}/loan-consultant-stats?user_id=${userId}&start_date=${start_date}&end_date=${end_date}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch previous circle stats');
    }

    const result: LoanConsultantStatsResponse = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error('Failed to get previous circle stats');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }

      // Fetch all time stats
      const allStats = await fetchAllStats();
      
      // Fetch both current and previous circle stats in parallel
      const [currentStats, previousStats] = await Promise.all([
        fetchCurrentCircleStats(),
        fetchPreviousCircleStats()
      ]);

      // Set all time stats as main data
      setData(allStats);
      
      // Set both circle stats for comparison
      setCircleStats({
        current: currentStats,
        previous: previousStats
      });

    } catch (error) {
      console.error('Error fetching loan consultant stats:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setData(null);
      setCircleStats({ current: null, previous: null });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentCircleStats, fetchPreviousCircleStats, fetchAllStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    circleStats,
    isLoading,
    error,
    refetch: fetchStats,
    fetchAllStats,
    getCircleDateRanges
  };
}