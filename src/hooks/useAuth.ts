'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as toastr from 'toastr';

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

  useEffect(() => {
    checkSession();
    
    // Set up interval to check session periodically
    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (response.ok && data.session) {
        setSession(data.session);
        setIsAuthenticated(true);
      } else {
        // Session is invalid or expired
        handleSessionExpired();
      }
    } catch (error) {
      console.error('Error checking session:', error);
      handleSessionExpired();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionExpired = () => {
    setSession(null);
    setIsAuthenticated(false);
    
    // Show notification
    toastr.warning('Your session has expired. Please log in again.', 'Session Expired');
    
    // Redirect to login page
    router.push('/signin');
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setIsAuthenticated(false);
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
