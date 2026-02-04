'use client';

import { useEffect, useRef } from 'react';
import { timeWatcher, TimeWatcherEvent } from '@/services/TimeWatcher';
import { useAuth } from '@/hooks/useAuth';

/**
 * TimeWatcherProvider Component
 * Initializes and manages the TimeWatcher service for real-time notifications
 * Only runs when user is authenticated
 */
export default function TimeWatcherProvider() {
  const isInitialized = useRef(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't initialize if still loading or not authenticated
    if (isLoading || !isAuthenticated) {
      // Stop TimeWatcher if user is not authenticated
      if (isInitialized.current && timeWatcher.isActive()) {
        timeWatcher.stop();
      }
      return;
    }

    // Only initialize once when authenticated
    if (isInitialized.current) {
      return;
    }

    // Add event listener for time events
    const handleTimeEvent = (event: TimeWatcherEvent) => {
      console.log('TimeWatcher Event:', event);
      // You can add additional logic here if needed
    };

    timeWatcher.addListener(handleTimeEvent);

    // Start the TimeWatcher
    timeWatcher.start();

    isInitialized.current = true;

    // Cleanup on unmount
    return () => {
      timeWatcher.removeListener(handleTimeEvent);
      timeWatcher.stop();
    };
  }, [isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
}
