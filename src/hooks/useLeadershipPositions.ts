'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LeadershipPosition {
  id: number;
  name: string;
  status: number;
  job_description: string;
  date_added: string;
}

/**
 * useLeadershipPositions Hook
 * Fetches leadership positions from the API
 * Caches the result to avoid multiple API calls
 */
export function useLeadershipPositions() {
  const [positions, setPositions] = useState<LeadershipPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('https://smartbackend.whencefinancesystem.com/leadership-positions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leadership positions');
      }

      const data = await response.json();
      
      // Filter only active positions (status === 1)
      const activePositions = data.filter((pos: LeadershipPosition) => pos.status === 1);
      setPositions(activePositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching leadership positions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  /**
   * Get position name by ID
   */
  const getPositionName = useCallback((positionId: number | undefined): string => {
    if (!positionId) return 'Branch Manager';
    const position = positions.find(pos => pos.id === positionId);
    return position?.name || 'Branch Manager';
  }, [positions]);

  /**
   * Get position ID by name
   */
  const getPositionId = useCallback((positionName: string | undefined): number | null => {
    if (!positionName) return null;
    const position = positions.find(pos => pos.name === positionName);
    return position?.id || null;
  }, [positions]);

  return {
    positions,
    isLoading,
    error,
    refetch: fetchPositions,
    getPositionName,
    getPositionId
  };
}

/**
 * Leadership positions cache for non-hook usage
 */
let positionsCache: LeadershipPosition[] | null = null;

export async function fetchLeadershipPositions(): Promise<LeadershipPosition[]> {
  if (positionsCache) {
    return positionsCache;
  }

  try {
    const response = await fetch('https://smartbackend.whencefinancesystem.com/leadership-positions');
    
    if (!response.ok) {
      throw new Error('Failed to fetch leadership positions');
    }

    const data = await response.json();
    
    // Filter only active positions (status === 1)
    positionsCache = data.filter((pos: LeadershipPosition) => pos.status === 1);
    return positionsCache || [];
  } catch (err) {
    console.error('Error fetching leadership positions:', err);
    return [];
  }
}

export default useLeadershipPositions;
