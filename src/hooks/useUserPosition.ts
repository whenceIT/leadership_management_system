'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Custom event names for impersonation sync
export const IMPERSONATION_STARTED_EVENT = 'impersonation:started';
export const IMPERSONATION_ENDED_EVENT = 'impersonation:ended';

// LocalStorage keys for impersonation
export const IMPERSONATION_STORAGE_KEY = 'impersonationData';
export const ORIGINAL_USER_STORAGE_KEY = 'originalUserData';

export interface ImpersonationData {
  userId: number;
  userName: string;
  userEmail: string;
  positionId: number;
  positionName: string;
  duration: number; // in minutes
  startedAt: number; // timestamp
  expiresAt: number; // timestamp
}

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  job_position?: number; // Primary position field from API
  position_id?: number; // Fallback field
  position?: string; // Keep for backward compatibility
  office_id?: number;
  status?: string;
  [key: string]: any;
}

interface LeadershipPosition {
  id: number;
  name: string;
  status: number;
  job_description: string;
  date_added: string;
}

/**
 * useUserPosition Hook
 * Gets the current user position_id from localStorage with automatic sync
 * Returns default position_id (5 for Branch Manager) if no position is set
 */
export function useUserPosition() {
  const [user, setUser] = useState<UserData | null>(null);
  const [positionId, setPositionId] = useState<number>(5); // Default to Branch Manager (id: 5)
  const [positionName, setPositionName] = useState<string>('Branch Manager');
  const [positions, setPositions] = useState<LeadershipPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const impersonationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to prevent over-polling - track if we've already synced
  const hasSyncedRef = useRef(false);
  const lastSyncedEmailRef = useRef<string | null>(null);
  const positionsLoadedRef = useRef(false);

  // Fetch all leadership positions from API (only once)
  const fetchPositions = useCallback(async () => {
    if (positionsLoadedRef.current) return;
    
    try {
      const response = await fetch('https://smartbackend.whencefinancesystem.com/leadership-positions');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPositions(data);
        positionsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching leadership positions:', error);
    }
  }, []);

  // Get position name from position_id
  const getPositionNameById = useCallback((id: number): string => {
    const position = positions.find(p => p.id === id);
    return position?.name || getPositionNameByIdStatic(id);
  }, [positions]);

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

  const syncAndGetPosition = useCallback(async (forceSync: boolean = false) => {
    // Check for impersonation data FIRST - this takes priority
    if (typeof window !== 'undefined') {
      try {
        const storedImpersonation = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
        if (storedImpersonation) {
          const impData = JSON.parse(storedImpersonation) as ImpersonationData;
          // Check if not expired
          if (impData.expiresAt && Date.now() < impData.expiresAt) {
            // Use impersonation data - don't fetch from API
            setPositionId(impData.positionId);
            setPositionName(impData.positionName);
            
            // Get the impersonated user from thisUser
            const thisUser = getUserData();
            if (thisUser) {
              setUser(thisUser);
            }
            
            setIsLoading(false);
            return;
          } else {
            // Impersonation expired - clean up
            localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
            localStorage.removeItem('impersonatedFromUser');
            localStorage.removeItem(ORIGINAL_USER_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Error checking impersonation data:', e);
      }
    }
    
    // Prevent over-polling: skip if already synced and not forcing
    const currentUser = getUserData();
    if (!forceSync && hasSyncedRef.current && lastSyncedEmailRef.current === currentUser?.email) {
      // Use cached data without API call
      if (currentUser) {
        setUser(currentUser);
        const cachedPositionId = currentUser.position_id || 5;
        setPositionId(cachedPositionId);
        setPositionName(currentUser.position || getPositionNameByIdStatic(cachedPositionId));
      }
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch positions first
      await fetchPositions();
      
      // Get user from localStorage
      if (!currentUser) {
        setPositionId(5);
        setPositionName('Branch Manager');
        setIsLoading(false);
        return;
      }

      // Fetch latest user data from API to get updated position_id
      if (currentUser.email) {
        try {
          const response = await fetch(`/api/auth/user?email=${encodeURIComponent(currentUser.email)}`);
          const data = await response.json();

          if (data.success && data.user) {
            // Merge with existing data
            const mergedUser = { ...currentUser, ...data.user };
            localStorage.setItem('thisUser', JSON.stringify(mergedUser));
            setUser(mergedUser);
            
            // Use position_id if available, otherwise fall back to position string
            const newPositionId = mergedUser.job_position || mergedUser.position_id || 5;
            setPositionId(newPositionId);
            setPositionName(mergedUser.position || getPositionNameById(newPositionId));
            
            // Mark as synced
            hasSyncedRef.current = true;
            lastSyncedEmailRef.current = currentUser.email;
          } else {
            setUser(currentUser);
            const existingPositionId = currentUser.position_id || 5;
            setPositionId(existingPositionId);
            setPositionName(currentUser.position || getPositionNameById(existingPositionId));
            
            // Mark as synced
            hasSyncedRef.current = true;
            lastSyncedEmailRef.current = currentUser.email;
          }
        } catch (error) {
          // If API fails, use localStorage data
          setUser(currentUser);
          const existingPositionId = currentUser.position_id || 5;
          setPositionId(existingPositionId);
          setPositionName(currentUser.position || getPositionNameById(existingPositionId));
          
          // Mark as synced even on error to prevent retries
          hasSyncedRef.current = true;
          lastSyncedEmailRef.current = currentUser.email;
        }
      } else {
        setUser(currentUser);
        const existingPositionId = currentUser.position_id || 5;
        setPositionId(existingPositionId);
        setPositionName(currentUser.position || getPositionNameById(existingPositionId));
        
        // Mark as synced
        hasSyncedRef.current = true;
        lastSyncedEmailRef.current = currentUser.email;
      }
    } catch (error) {
      console.error('Error getting user position:', error);
      setPositionId(5);
      setPositionName('Branch Manager');
    } finally {
      setIsLoading(false);
    }
  }, [getUserData, fetchPositions]);

  useEffect(() => {
    syncAndGetPosition(false); // Don't force sync, use cached data if available
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
   * Impersonate a user's position temporarily by position_id
   * @param targetPositionId - The position_id to impersonate
   * @param durationMinutes - How long to impersonate before reverting (default: 60 minutes)
   * @returns Object with impersonation info and cancel function
   */
  const impersonatePosition = useCallback((
    targetPositionId: number,
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

      // Update position_id to target
      const targetPositionName = getPositionNameById(targetPositionId);
      const impersonatedUser = { ...currentUser, position_id: targetPositionId, position: targetPositionName };
      localStorage.setItem('thisUser', JSON.stringify(impersonatedUser));

      // Update state
      setUser(impersonatedUser);
      setPositionId(targetPositionId);
      setPositionName(targetPositionName);

      // Clear any existing timeout
      clearImpersonationTimeout();

      // Set timeout to revert
      const timeoutMs = durationMinutes * 60 * 1000;
      impersonationTimeoutRef.current = setTimeout(() => {
        cancelImpersonation();
      }, timeoutMs);

      // Dispatch custom event to notify other components (like DashboardWrapper)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(IMPERSONATION_STARTED_EVENT, {
          detail: { positionId: targetPositionId, positionName: targetPositionName }
        }));
      }

      return {
        success: true,
        message: `Now impersonating as ${targetPositionName}. Reverting in ${durationMinutes} minutes.`,
        cancel: cancelImpersonation
      };
    } catch (error) {
      console.error('Error impersonating position:', error);
      return { success: false, message: 'Failed to impersonate position', cancel: () => {} };
    }
  }, [getUserData, clearImpersonationTimeout, getPositionNameById]);

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
      localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      localStorage.removeItem(ORIGINAL_USER_STORAGE_KEY);

      // Update state
      setUser(originalUser);
      const originalPositionId = originalUser.position_id || 5;
      setPositionId(originalPositionId);
      setPositionName(originalUser.position || getPositionNameById(originalPositionId));

      // Dispatch custom event to notify other components (like DashboardWrapper)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(IMPERSONATION_ENDED_EVENT, {
          detail: { positionId: originalPositionId, positionName: originalUser.position || getPositionNameById(originalPositionId) }
        }));
      }

      return true;
    } catch (error) {
      console.error('Error cancelling impersonation:', error);
      return false;
    }
  }, [getOriginalUser, clearImpersonationTimeout, getPositionNameById]);

  /**
   * Get current impersonation data
   */
  const getImpersonationData = useCallback((): ImpersonationData | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as ImpersonationData;
      
      // Check if expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        // Auto-expire
        cancelImpersonation();
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  }, [cancelImpersonation]);

  /**
   * Start full impersonation with user and position
   * @param targetUser - The user to impersonate (mock user data)
   * @param targetPositionId - The position_id to impersonate
   * @param durationMinutes - How long to impersonate before reverting
   * @returns Object with impersonation info
   */
  const startImpersonation = useCallback((
    targetUser: { id: number; first_name: string; last_name: string; email: string },
    targetPositionId: number,
    durationMinutes: number = 60
  ): { success: boolean; message: string } => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Not available on server' };
    }

    try {
      const currentUser = getUserData();
      if (!currentUser) {
        return { success: false, message: 'No user logged in' };
      }

      // Store original user data
      localStorage.setItem(ORIGINAL_USER_STORAGE_KEY, JSON.stringify(currentUser));
      localStorage.setItem('impersonatedFromUser', JSON.stringify(currentUser));

      // Create impersonation data
      const targetPositionName = getPositionNameById(targetPositionId);
      const now = Date.now();
      const impersonationData: ImpersonationData = {
        userId: targetUser.id,
        userName: `${targetUser.first_name} ${targetUser.last_name}`,
        userEmail: targetUser.email,
        positionId: targetPositionId,
        positionName: targetPositionName,
        duration: durationMinutes,
        startedAt: now,
        expiresAt: now + (durationMinutes * 60 * 1000)
      };

      // Store impersonation data
      localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(impersonationData));

      // Update thisUser with impersonated user data
      const impersonatedUser = {
        ...currentUser,
        id: targetUser.id,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        email: targetUser.email,
        position_id: targetPositionId,
        position: targetPositionName
      };
      localStorage.setItem('thisUser', JSON.stringify(impersonatedUser));

      // Update state
      setUser(impersonatedUser);
      setPositionId(targetPositionId);
      setPositionName(targetPositionName);

      // Clear any existing timeout
      clearImpersonationTimeout();

      // Set timeout to auto-revert
      const timeoutMs = durationMinutes * 60 * 1000;
      impersonationTimeoutRef.current = setTimeout(() => {
        cancelImpersonation();
      }, timeoutMs);

      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(IMPERSONATION_STARTED_EVENT, {
          detail: { 
            positionId: targetPositionId, 
            positionName: targetPositionName,
            userId: targetUser.id,
            userName: `${targetUser.first_name} ${targetUser.last_name}`
          }
        }));
      }

      return {
        success: true,
        message: `Now impersonating ${targetUser.first_name} ${targetUser.last_name} (${targetPositionName}). Reverting in ${durationMinutes} minutes.`
      };
    } catch (error) {
      console.error('Error starting impersonation:', error);
      return { success: false, message: 'Failed to start impersonation' };
    }
  }, [getUserData, getPositionNameById, clearImpersonationTimeout, cancelImpersonation]);

  /**
   * Permanently change a user's position_id (not temporary impersonation)
   * @param newPositionId - The new position_id to set
   */
  const setPositionPermanently = useCallback((
    newPositionId: number
  ): { success: boolean; message: string } => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Not available on server' };
    }

    try {
      const currentUser = getUserData();
      if (!currentUser) {
        return { success: false, message: 'No user logged in' };
      }

      const newPositionName = getPositionNameById(newPositionId);
      // Update position_id
      const updatedUser = { ...currentUser, position_id: newPositionId, position: newPositionName };
      localStorage.setItem('thisUser', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
      setPositionId(newPositionId);
      setPositionName(newPositionName);

      return { success: true, message: `Position updated to ${newPositionName}` };
    } catch (error) {
      console.error('Error setting position permanently:', error);
      return { success: false, message: 'Failed to update position' };
    }
  }, [getUserData, getPositionNameById]);

  return {
    user,
    positionId,
    positionName,
    positions,
    isLoading,
    refreshPosition: syncAndGetPosition,
    impersonatePosition,
    startImpersonation,
    cancelImpersonation,
    isImpersonating,
    getImpersonationData,
    setPositionPermanently,
    getOriginalUser,
    getPositionNameById
  };
}

/**
 * getUserPosition utility function
 * Gets user position_id synchronously from localStorage
 * Checks both job_position and position_id fields
 */
export function getUserPositionId(): number {
  if (typeof window === 'undefined') {
    return 5; // Default to Branch Manager
  }

  try {
    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) {
      return 5;
    }

    const user = JSON.parse(storedUser);
    // Check job_position first (from API), then fall back to position_id
    return user.job_position || user.position_id || 5;
  } catch (e) {
    return 5;
  }
}

/**
 * Get position name by ID (utility function)
 */
export function getPositionNameByIdStatic(id: number): string {
  // Default fallback positions
  const defaultPositions: Record<number, string> = {
    1: 'General Operations Manager (GOM)',
    2: 'Provincial Manager',
    3: 'District Regional Manager',
    4: 'District Manager',
    5: 'Branch Manager',
    6: 'IT Manager',
    7: 'Risk Manager',
    8: 'Management Accountant',
    9: 'Motor Vehicles Manager',
    10: 'Payroll Loans Manager',
    11: 'Policy & Training Manager',
    12: 'Manager Administration',
    13: 'R&D Coordinator',
    14: 'Recoveries Coordinator',
    15: 'IT Coordinator',
    16: 'General Operations Administrator (GOA)',
    17: 'Performance Operations Administrator (POA)',
    18: 'Creative Artwork & Marketing Representative Manager',
    19: 'Administration',
    20: 'Super Seer',
    21: 'Loan Consultant',
  };
  
  return defaultPositions[id] || 'Branch Manager';
}

/**
 * Backward compatibility: getUserPosition (returns position name)
 * @deprecated Use getUserPositionId() instead for position_id
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
    // First try position string, then job_position, then position_id lookup
    if (user.position) {
      return user.position;
    }
    // Check job_position (from API) or position_id
    const positionId = user.job_position || user.position_id;
    if (positionId) {
      return getPositionNameByIdStatic(positionId);
    }
    return 'Branch Manager';
  } catch (e) {
    return 'Branch Manager';
  }
}

/**
 * Get all available positions for impersonation (deprecated, use positions from hook)
 * @deprecated Use positions array from useUserPosition hook instead
 */
export const AVAILABLE_POSITIONS = [
  'General Operations Manager (GOM)',
  'Provincial Manager',
  'District Regional Manager',
  'District Manager',
  'Branch Manager',
  'IT Manager',
  'Risk Manager',
  'Management Accountant',
  'Motor Vehicles Manager',
  'Payroll Loans Manager',
  'Policy & Training Manager',
  'Manager Administration',
  'R&D Coordinator',
  'Recoveries Coordinator',
  'IT Coordinator',
  'General Operations Administrator (GOA)',
  'Performance Operations Administrator (POA)',
  'Creative Artwork & Marketing Representative Manager',
  'Administration',
  'Super Seer',
  'Loan Consultant',
] as const;

export type PositionType = typeof AVAILABLE_POSITIONS[number];

export default useUserPosition;
