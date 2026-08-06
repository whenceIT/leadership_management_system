'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  userId: number;
  email: string;
  name?: string;
  status?: string;
}

/**
 * useAuth Hook
 * Manages authentication state and handles session expiration
 */
export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wasPreviouslyAuthenticated, setWasPreviouslyAuthenticated] = useState(false);

  const handleSessionExpired = useCallback(() => {
    setSession(null);
    setIsAuthenticated(false);
    setWasPreviouslyAuthenticated(false);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thisUser');
      } catch (e) {
        // ignore
      }

      // Notify any UI listeners to show the non-closable overlay
      try {
        window.dispatchEvent(new Event('session:expired'));
      } catch (e) {
        // ignore
      }
    }

    // Delay redirect slightly to allow the overlay to render
    setTimeout(() => {
      window.location.replace('/signin');
    }, 2200);
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (response.ok && data.session) {
        setSession(data.session);
        setIsAuthenticated(true);
        setWasPreviouslyAuthenticated(true);
      } else if (response.status === 401) {
        // Session is invalid or expired, clear auth state and redirect
        handleSessionExpired();
      } else {
        setSession(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Only handle session expired if user was previously authenticated
      if (wasPreviouslyAuthenticated || isAuthenticated) {
        handleSessionExpired();
      } else {
        setSession(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [wasPreviouslyAuthenticated, isAuthenticated, handleSessionExpired]);
 

  useEffect(() => {
    checkSession();
    
    // Set up interval to check session periodically (every 30 seconds)
    const interval = setInterval(checkSession, 30000);
    
    return () => clearInterval(interval);
  }, [checkSession]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setIsAuthenticated(false);
      setWasPreviouslyAuthenticated(false);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('thisUser');
      }
      
      router.push('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    session,
    isLoading,
    isAuthenticated,
    logout,
    refreshSession: checkSession,
  };
}

/**
 * useRequireAuth Hook
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth() {
  const { session, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    session,
    isLoading,
    isAuthenticated,
  };
}
