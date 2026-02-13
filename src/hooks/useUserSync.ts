'use client';

import { useEffect, useCallback } from 'react';

interface UserData {
  [key: string]: any;
}

/**
 * useUserSync Hook
 * Fetches latest user data from API and syncs it with localStorage
 * This hook should be called in page components to keep user data consistent
 */
export function useUserSync() {
  const syncUserData = useCallback(async () => {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        return;
      }

      // Get current user from localStorage
      const storedUser = localStorage.getItem('thisUser');
      if (!storedUser) {
        return;
      }

      const currentUser: UserData = JSON.parse(storedUser);
      
      // Check if user has an email
      if (!currentUser.email) {
        return;
      }

      // Fetch latest user data from API
      const response = await fetch(`/api/auth/user?email=${encodeURIComponent(currentUser.email)}`);
      const data = await response.json();

      if (data.success && data.user) {
        // Get existing localStorage data
        const existingData = JSON.parse(localStorage.getItem('thisUser') || '{}');
        
        // Merge new data with existing data (new data takes precedence)
        const mergedData = {
          ...existingData,
          ...data.user,
          // Ensure position_id is preserved if not in new data
          position_id: data.user.position_id || existingData.position_id,
          // Ensure position is preserved if not in new data
          position: data.user.position || existingData.position,
        };
        
        // Save merged data back to localStorage
        localStorage.setItem('thisUser', JSON.stringify(mergedData));
        
        console.log('User data synced successfully');
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }, []);

  // Run sync on mount and when component renders
  useEffect(() => {
    syncUserData();
  }, [syncUserData]);
}

/**
 * useUserData Hook
 * Gets the current user data from localStorage with automatic sync
 * Use this hook in components that need to display user data
 */
export function useUserData() {
  useUserSync();

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

  return { getUserData };
}

export default useUserSync;
