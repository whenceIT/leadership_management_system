'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserPositionId } from '@/hooks/useUserPosition';

interface Tier {
  id: number;
  name: string;
  description: string;
  tier_range: string;
  minimum_portfolio_value: number;
  badge_color: string;
  text_color: string;
}

interface Benefit {
  benefit_type: string;
  description: string;
  value: string;
}

interface UserTierData {
  user_id: number;
  current_tier: Tier;
  next_tier: Tier;
  portfolio_summary: {
    current_value: number;
    current_formatted: string;
    required_for_next_tier: number;
    required_formatted: string;
    progress_percentage: number;
  };
  benefits: Benefit[];
  historical_tiers: Array<{
    tier_id: number;
    tier_name: string;
    effective_from: string;
    effective_to: string | null;
  }>;
}

export function useUserTier() {
  const [data, setData] = useState<UserTierData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const API_BASE_URL = 'https://smartbackend.whencefinancesystem.com';
  
  // Get user from localStorage directly to avoid circular dependencies
  const getUserId = useCallback((): number => {
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
  }, []);
  
  const fetchUserTier = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      const response = await fetch(`${API_BASE_URL}/user-tiers/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user tier data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to get user tier data');
      }
    } catch (error) {
      console.error('Error fetching user tier data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setData(null); // Set data to null instead of fallback
    } finally {
      setIsLoading(false);
    }
  }, [getUserId]);
  
  const updatePortfolioValue = useCallback(async (portfolioValue: number) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      const response = await fetch(`${API_BASE_URL}/user-tiers/${userId}/portfolio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_value: portfolioValue
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update portfolio value');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refetch the user tier data to get updated information
        await fetchUserTier();
        return result;
      } else {
        throw new Error(result.message || 'Failed to update portfolio value');
      }
    } catch (error) {
      console.error('Error updating portfolio value:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [getUserId, fetchUserTier]);
  
  useEffect(() => {
    fetchUserTier();
  }, [fetchUserTier]);
  
  return {
    data,
    isLoading,
    isUpdating,
    error,
    refetch: fetchUserTier,
    updatePortfolioValue
  };
}
