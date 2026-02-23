import { useState, useEffect, useCallback } from 'react';
import BranchDataService from '@/services/BranchDataService';
import { 
  ActiveLoansData, 
  BranchStatsData, 
  CollectionRateData, 
  StaffProductivityData, 
  Month1DefaultRateData,
  CollectionWaterfallData,
  BranchStatsParams,
  ActiveLoansParams,
  CollectionRateParams,
  StaffProductivityParams,
  Month1DefaultRateParams,
  CollectionWaterfallParams
} from '@/services/BranchDataService';
import { useUserPosition } from '@/hooks/useUserPosition';

/**
 * Hook to fetch and manage branch manager metrics using BranchDataService
 */
export function useBranchManagerMetrics() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Metrics state
  const [activeLoans, setActiveLoans] = useState<ActiveLoansData | null>(null);
  const [branchStats, setBranchStats] = useState<BranchStatsData | null>(null);
  const [collectionRate, setCollectionRate] = useState<CollectionRateData | null>(null);
  const [staffProductivity, setStaffProductivity] = useState<StaffProductivityData | null>(null);
  const [month1DefaultRate, setMonth1DefaultRate] = useState<Month1DefaultRateData | null>(null);
  const [collectionWaterfall, setCollectionWaterfall] = useState<CollectionWaterfallData | null>(null);

  const { user } = useUserPosition();

  // Get BranchDataService instance
  const branchDataService = BranchDataService.getInstance();

  // Helper to get office ID from user context or fallback
  const getOfficeId = useCallback((): number | null => {
    if (!user) return null;
    
    try {
      const officeId = user.office_id || user.officeId || 0;
      return Number(officeId) || null;
    } catch (error) {
      console.error('Error getting office ID:', error);
      return null;
    }
  }, [user]);

  // Fetch all branch manager metrics
  const fetchAllMetrics = useCallback(async (officeId: number, periodStart?: string, periodEnd?: string) => {
    if (!officeId) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const metrics = await branchDataService.fetchBranchManagerMetrics(
        officeId,
        periodStart,
        periodEnd
      );

      // Update state with fetched metrics
      setActiveLoans(metrics.activeLoans || null);
      setBranchStats(metrics.branchStats || null);
      setCollectionRate(metrics.collectionRate || null);
      setStaffProductivity(metrics.staffProductivity || null);
      setMonth1DefaultRate(metrics.month1DefaultRate || null);
      setCollectionWaterfall(metrics.collectionWaterfall || null);

    } catch (err) {
      console.error('Error fetching branch manager metrics:', err);
      setError('Failed to fetch branch manager metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch individual metrics
  const fetchActiveLoans = useCallback(async (params: ActiveLoansParams) => {
    if (!params.office_id) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await branchDataService.fetchActiveLoans(params);
      setActiveLoans(data || null);
    } catch (err) {
      console.error('Error fetching active loans:', err);
      setError('Failed to fetch active loans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBranchStats = useCallback(async (params: BranchStatsParams) => {
    if (!params.office_id) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await branchDataService.fetchBranchStats(params);
      setBranchStats(data || null);
    } catch (err) {
      console.error('Error fetching branch stats:', err);
      setError('Failed to fetch branch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCollectionRate = useCallback(async (params: CollectionRateParams) => {
    if (!params.office_id) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await branchDataService.fetchCollectionRate(params);
      setCollectionRate(data || null);
    } catch (err) {
      console.error('Error fetching collection rate:', err);
      setError('Failed to fetch collection rate');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStaffProductivity = useCallback(async (params: StaffProductivityParams) => {
    if (!params.office_id) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await branchDataService.fetchStaffProductivity(params);
      setStaffProductivity(data || null);
    } catch (err) {
      console.error('Error fetching staff productivity:', err);
      setError('Failed to fetch staff productivity');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMonth1DefaultRate = useCallback(async (params: Month1DefaultRateParams) => {
    if (!params.office_id) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await branchDataService.fetchMonth1DefaultRate(params);
      setMonth1DefaultRate(data || null);
    } catch (err) {
      console.error('Error fetching Month-1 default rate:', err);
      setError('Failed to fetch Month-1 default rate');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCollectionWaterfall = useCallback(async (params: CollectionWaterfallParams) => {
    if (!params.office_id) {
      setError('Office ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await branchDataService.fetchCollectionWaterfall(params);
      setCollectionWaterfall(data || null);
    } catch (err) {
      console.error('Error fetching collection waterfall:', err);
      setError('Failed to fetch collection waterfall');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh all metrics
  const refreshAllMetrics = useCallback(async (periodStart?: string, periodEnd?: string) => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchAllMetrics(officeId, periodStart, periodEnd);
    }
  }, [getOfficeId, fetchAllMetrics]);

  // Refresh individual metrics
  const refreshActiveLoans = useCallback(async () => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchActiveLoans({ office_id: officeId });
    }
  }, [getOfficeId, fetchActiveLoans]);

  const refreshBranchStats = useCallback(async () => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchBranchStats({ office_id: officeId });
    }
  }, [getOfficeId, fetchBranchStats]);

  const refreshCollectionRate = useCallback(async (periodStart?: string, periodEnd?: string) => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchCollectionRate({ 
        office_id: officeId, 
        period_start: periodStart, 
        period_end: periodEnd 
      });
    }
  }, [getOfficeId, fetchCollectionRate]);

  const refreshStaffProductivity = useCallback(async (periodStart?: string, periodEnd?: string) => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchStaffProductivity({ 
        office_id: officeId, 
        period_start: periodStart, 
        period_end: periodEnd 
      });
    }
  }, [getOfficeId, fetchStaffProductivity]);

  const refreshMonth1DefaultRate = useCallback(async (periodStart?: string, periodEnd?: string) => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchMonth1DefaultRate({ 
        office_id: officeId, 
        period_start: periodStart, 
        period_end: periodEnd 
      });
    }
  }, [getOfficeId, fetchMonth1DefaultRate]);

  const refreshCollectionWaterfall = useCallback(async (periodStart?: string, periodEnd?: string) => {
    const officeId = getOfficeId();
    if (officeId) {
      await fetchCollectionWaterfall({ 
        office_id: officeId, 
        start_date: periodStart, 
        end_date: periodEnd 
      });
    }
  }, [getOfficeId, fetchCollectionWaterfall]);

  // Initialize metrics on component mount or when user changes
  useEffect(() => {
    const officeId = getOfficeId();
    if (officeId) {
      fetchAllMetrics(officeId);
    }
  }, [getOfficeId, fetchAllMetrics]);

  // Clear cache
  const clearCache = useCallback(() => {
    branchDataService.clearCache();
  }, []);

  return {
    // Loading and error state
    isLoading,
    error,

    // Metrics data
    activeLoans,
    branchStats,
    collectionRate,
    staffProductivity,
    month1DefaultRate,
    collectionWaterfall,

    // Refresh methods
    refreshAllMetrics,
    refreshActiveLoans,
    refreshBranchStats,
    refreshCollectionRate,
    refreshStaffProductivity,
    refreshMonth1DefaultRate,
    refreshCollectionWaterfall,

    // Individual fetch methods
    fetchAllMetrics,
    fetchActiveLoans,
    fetchBranchStats,
    fetchCollectionRate,
    fetchStaffProductivity,
    fetchMonth1DefaultRate,
    fetchCollectionWaterfall,

    // Cache management
    clearCache,
  };
}
