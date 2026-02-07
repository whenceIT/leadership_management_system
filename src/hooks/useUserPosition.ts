'use client';

import { useState, useEffect, useCallback } from 'react';

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

  return { user, position, isLoading, refreshPosition: syncAndGetPosition };
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

export default useUserPosition;
