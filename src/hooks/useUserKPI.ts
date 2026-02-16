'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserKPIScore {
  score_id: number;
  kpi_id: number;
  user_id: number;
  score: string;
  name: string;
  description: string;
  scoring: string;
  target: string;
  role: number;
  position_id: number;
  category: string;
  weight: string;
}

export interface ProcessedKPI {
  name: string;
  value: number;
  target: number;
  score: number; // percentage achieved
  category: string;
  weight: number;
  description: string;
  format: 'currency' | 'percent' | 'number' | 'rating';
  lowerIsBetter: boolean;
}

/**
 * useUserKPI Hook
 * Fetches real-time KPI scores from the API for the current user
 * API: GET https://smartbackend.whencefinancesystem.com/smart-kpi-scores/{user_id}/{position_id}
 */
export function useUserKPI() {
  const [kpiScores, setKpiScores] = useState<UserKPIScore[]>([]);
  const [processedKPIs, setProcessedKPIs] = useState<ProcessedKPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [jobPosition, setJobPosition] = useState<number | null>(null);

  // Get user ID and position ID from localStorage
  const getUserData = useCallback((): { id: number | null; job_position: number | null } => {
    if (typeof window === 'undefined') {
      return { id: null, job_position: null };
    }

    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) {
      return { id: null, job_position: null };
    }

    try {
      const user = JSON.parse(storedUser);
      return { 
        id: user.id || null,
        job_position: user.job_position || user.position_id || null
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
      return { id: null, job_position: null };
    }
  }, []);

  // Process raw API scores into usable KPI format
  const processKPIScores = useCallback((scores: UserKPIScore[]): ProcessedKPI[] => {
    return scores.map((item) => {
      const scoreValue = parseFloat(item.score) || 0;
      const targetValue = parseFloat(item.target) || 1;
      const weightValue = parseFloat(item.weight) || 0;

      // Calculate percentage achieved
      let percentageAchieved = 0;
      if (targetValue > 0) {
        percentageAchieved = (scoreValue / targetValue) * 100;
      }

      // Determine format based on scoring type
      let format: ProcessedKPI['format'] = 'number';
      if (item.scoring === 'percentage') {
        format = 'percent';
      } else if (item.name.toLowerCase().includes('revenue') || 
                 item.name.toLowerCase().includes('amount') ||
                 item.name.toLowerCase().includes('given')) {
        format = 'currency';
      }

      // Categories where lower is better
      const lowerIsBetterCategories = ['default', 'overdue', 'late', 'fail', 'churn'];
      const isLowerBetter = lowerIsBetterCategories.some(cat => 
        item.name.toLowerCase().includes(cat) || 
        item.category?.toLowerCase().includes(cat)
      );

      return {
        name: item.name,
        value: scoreValue,
        target: targetValue,
        score: percentageAchieved,
        category: item.category || 'general',
        weight: weightValue,
        description: item.description,
        format,
        lowerIsBetter: isLowerBetter,
      };
    });
  }, []);

  // Fetch KPI scores from API
  const fetchKPIScores = useCallback(async (uid: number, pid: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the API with both user_id and position_id
      const url = `https://smartbackend.whencefinancesystem.com/smart-kpi-scores/${uid}/${pid}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setKpiScores(data);
        setProcessedKPIs(processKPIScores(data));
      } else {
        setKpiScores([]);
        setProcessedKPIs([]);
      }
    } catch (err) {
      console.error('Error fetching KPI scores:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setKpiScores([]);
      setProcessedKPIs([]);
    } finally {
      setIsLoading(false);
    }
  }, [processKPIScores]);

  // Refresh KPI data
  const refresh = useCallback(() => {
    const userData = getUserData();
    if (userData.id) {
      setUserId(userData.id);
      const jobPos = userData.job_position || 5; // Default to position 5 if null
      setJobPosition(jobPos);
      fetchKPIScores(userData.id, jobPos);
    }
  }, [getUserData, fetchKPIScores]);

  // Initial fetch on mount
  useEffect(() => {
    const userData = getUserData();
    if (userData.id) {
      setUserId(userData.id);
      const jobPos = userData.job_position || 5; // Default to position 5 if null
      setJobPosition(jobPos);
      fetchKPIScores(userData.id, jobPos);
    } else {
      setIsLoading(false);
    }
  }, [getUserData, fetchKPIScores]);

  // Calculate overall score
  const getOverallScore = useCallback((): number => {
    if (processedKPIs.length === 0) return 0;

    let totalWeight = 0;
    let weightedScore = 0;

    processedKPIs.forEach((kpi) => {
      totalWeight += kpi.weight;
      
      let score = 0;
      if (kpi.lowerIsBetter) {
        // For metrics where lower is better
        if (kpi.value <= kpi.target) {
          score = 100;
        } else {
          score = Math.max(0, 100 - ((kpi.value - kpi.target) / kpi.target) * 100);
        }
      } else {
        // For metrics where higher is better
        score = Math.min(100, (kpi.value / kpi.target) * 100);
      }

      weightedScore += score * kpi.weight;
    });

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }, [processedKPIs]);

  // Get KPIs by category
  const getKPIsByCategory = useCallback((category: string): ProcessedKPI[] => {
    return processedKPIs.filter(kpi => 
      kpi.category?.toLowerCase() === category.toLowerCase()
    );
  }, [processedKPIs]);

  // Get all unique categories
  const getCategories = useCallback((): string[] => {
    const categories = new Set(processedKPIs.map(kpi => kpi.category));
    return Array.from(categories);
  }, [processedKPIs]);

  return {
    kpiScores,
    processedKPIs,
    isLoading,
    error,
    userId,
    jobPosition,
    refresh,
    getOverallScore,
    getKPIsByCategory,
    getCategories,
  };
}

export default useUserKPI;
