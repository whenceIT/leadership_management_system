'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position?: string;
  office_id?: number;
  status?: string;
  [key: string]: any;
}

/**
 * useUserPosition Hook
 * Gets the current user position from localStorage with automatic sync
 * Returns default 'Branch Manager' if no position is set
 */
export function useUserPosition() {
  const [user, setUser] = useState<UserData | null>(null);
  const [position, setPosition] = useState<string>('Branch Manager');
  const [isLoading, setIsLoading] = useState(true);
  const impersonationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getUserData = useCallback((): UserData | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      return null;
    }
  }, []);

  const syncAndGetPosition = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get user from localStorage
      const currentUser = getUserData();
      
      if (!currentUser) {
        setPosition('Branch Manager');
        setIsLoading(false);
        return;
      }

      // Fetch latest user data from API to get updated position
      if (currentUser.email) {
        try {
          const response = await fetch(`/api/auth/user?email=${encodeURIComponent(currentUser.email)}`);
          const data = await response.json();

          if (data.success && data.user) {
            // Merge with existing data
            const mergedUser = { ...currentUser, ...data.user };
            localStorage.setItem('thisUser', JSON.stringify(mergedUser));
            setUser(mergedUser);
            setPosition(mergedUser.position || 'Branch Manager');
          } else {
            setUser(currentUser);
            setPosition(currentUser.position || 'Branch Manager');
          }
        } catch (error) {
          // If API fails, use localStorage data
          setUser(currentUser);
          setPosition(currentUser.position || 'Branch Manager');
        }
      } else {
        setUser(currentUser);
        setPosition(currentUser.position || 'Branch Manager');
      }
    } catch (error) {
      console.error('Error getting user position:', error);
      setPosition('Branch Manager');
    } finally {
      setIsLoading(false);
    }
  }, [getUserData]);

  useEffect(() => {
    syncAndGetPosition();
  }, [syncAndGetPosition]);

  /**
   * Clear any existing impersonation timeout
   */
  const clearImpersonationTimeout = useCallback(() => {
    if (impersonationTimeoutRef.current) {
      clearTimeout(impersonationTimeoutRef.current);
      impersonationTimeoutRef.current = null;
    }
  }, []);

  /**
   * Get the original user data (before impersonation)
   */
  const getOriginalUser = useCallback((): UserData | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedUser = localStorage.getItem('impersonatedFromUser');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (e) {
      return null;
    }
  }, []);

  /**
   * Check if currently impersonating another user
   */
  const isImpersonating = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem('impersonatedFromUser') !== null;
  }, []);

  /**
   * Impersonate a user's position temporarily
   * @param targetPosition - The position to impersonate
   * @param durationMinutes - How long to impersonate before reverting (default: 60 minutes)
   * @returns Object with impersonation info and cancel function
   */
  const impersonatePosition = useCallback((
    targetPosition: string,
    durationMinutes: number = 60
  ): { success: boolean; message: string; cancel: () => void } => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Not available on server', cancel: () => {} };
    }

    try {
      const currentUser = getUserData();
      if (!currentUser) {
        return { success: false, message: 'No user logged in', cancel: () => {} };
      }

      // Store original user data for reverting
      localStorage.setItem('impersonatedFromUser', JSON.stringify(currentUser));

      // Update position to target
      const impersonatedUser = { ...currentUser, position: targetPosition };
      localStorage.setItem('thisUser', JSON.stringify(impersonatedUser));

      // Update state
      setUser(impersonatedUser);
      setPosition(targetPosition);

      // Clear any existing timeout
      clearImpersonationTimeout();

      // Set timeout to revert
      const timeoutMs = durationMinutes * 60 * 1000;
      impersonationTimeoutRef.current = setTimeout(() => {
        cancelImpersonation();
      }, timeoutMs);

      return {
        success: true,
        message: `Now impersonating as ${targetPosition}. Reverting in ${durationMinutes} minutes.`,
        cancel: cancelImpersonation
      };
    } catch (error) {
      console.error('Error impersonating position:', error);
      return { success: false, message: 'Failed to impersonate position', cancel: () => {} };
    }
  }, [getUserData, clearImpersonationTimeout]);

  /**
   * Cancel impersonation and revert to original user
   */
  const cancelImpersonation = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const originalUser = getOriginalUser();
      if (!originalUser) {
        return false;
      }

      // Clear timeout
      clearImpersonationTimeout();

      // Restore original user data
      localStorage.setItem('thisUser', JSON.stringify(originalUser));
      localStorage.removeItem('impersonatedFromUser');

      // Update state
      setUser(originalUser);
      setPosition(originalUser.position || 'Branch Manager');

      return true;
    } catch (error) {
      console.error('Error cancelling impersonation:', error);
      return false;
    }
  }, [getOriginalUser, clearImpersonationTimeout]);

  /**
   * Permanently change a user's position (not temporary impersonation)
   * @param newPosition - The new position to set
   */
  const setPositionPermanently = useCallback((
    newPosition: string
  ): { success: boolean; message: string } => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Not available on server' };
    }

    try {
      const currentUser = getUserData();
      if (!currentUser) {
        return { success: false, message: 'No user logged in' };
      }

      // Update position
      const updatedUser = { ...currentUser, position: newPosition };
      localStorage.setItem('thisUser', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
      setPosition(newPosition);

      return { success: true, message: `Position updated to ${newPosition}` };
    } catch (error) {
      console.error('Error setting position permanently:', error);
      return { success: false, message: 'Failed to update position' };
    }
  }, [getUserData]);

  return {
    user,
    position,
    isLoading,
    refreshPosition: syncAndGetPosition,
    impersonatePosition,
    cancelImpersonation,
    isImpersonating,
    setPositionPermanently,
    getOriginalUser
  };
}

/**
 * getUserPosition utility function
 * Gets user position synchronously from localStorage
 */
export function getUserPosition(): string {
  if (typeof window === 'undefined') {
    return 'Branch Manager';
  }

  try {
    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) {
      return 'Branch Manager';
    }

    const user = JSON.parse(storedUser);
    return user.position || 'Branch Manager';
  } catch (e) {
    return 'Branch Manager';
  }
}

/**
 * Get all available positions for impersonation
 */
export const AVAILABLE_POSITIONS = [
  'Branch Manager',
  'District Manager',
  'Provincial Manager',
  'General Operations Manager (GOM)',
  'General Operations Administrator (GOA)',
  'General Operations Manager',
  'IT Manager',
  'IT Coordinator',
  'Management Accountant',
  'Risk Manager',
  'Recoveries Coordinator',
  'Motor Vehicles Manager',
  'Payroll Loans Manager',
  'Policy & Training Manager',
  'R&D Coordinator',
  'Manager Administration',
  'Administration',
  'Creative Artwork & Marketing Representative Manager',
  'District Regional Manager',
  'Performance Operations Administrator (POA)',
] as const;

export type PositionType = typeof AVAILABLE_POSITIONS[number];

export default useUserPosition;
