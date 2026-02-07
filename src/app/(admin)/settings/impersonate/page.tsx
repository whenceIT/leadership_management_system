'use client';

import React, { useState, useEffect } from 'react';
import { useUserPosition, AVAILABLE_POSITIONS, PositionType } from '@/hooks/useUserPosition';
import Button from '@/components/ui/button/Button';

export default function ImpersonateProfilePage() {
  const {
    user,
    position: currentPosition,
    isLoading,
    impersonatePosition,
    cancelImpersonation,
    isImpersonating,
    getOriginalUser
  } = useUserPosition();

  const [selectedPosition, setSelectedPosition] = useState<PositionType>('Branch Manager');
  const [duration, setDuration] = useState<number>(60);
  const [impersonationStatus, setImpersonationStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check for impersonation status on mount
  useEffect(() => {
    if (isImpersonating()) {
      const originalUser = getOriginalUser();
      if (originalUser) {
        setImpersonationStatus({
          success: true,
          message: `Currently impersonating as ${currentPosition}. Original user: ${originalUser.first_name} ${originalUser.last_name}`
        });
      }
    }
  }, [isImpersonating, currentPosition, getOriginalUser]);

  const handleImpersonate = () => {
    setImpersonationStatus(null);
    const result = impersonatePosition(selectedPosition, duration);
    setImpersonationStatus({
      success: result.success,
      message: result.message
    });
  };

  const handleCancelImpersonation = () => {
    const success = cancelImpersonation();
    if (success) {
      setImpersonationStatus({
        success: true,
        message: 'Impersonation cancelled. Reverted to original position.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Impersonate Profile
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Temporarily assume another user's position to test their view and permissions
        </p>
      </div>

      {/* Current User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Session
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Position</p>
            <p className="font-medium text-brand-500">{currentPosition}</p>
          </div>
        </div>

        {isImpersonating() && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  ⚠️ You are currently impersonating
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Original position will be restored automatically or when you cancel
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCancelImpersonation}
              >
                Cancel Impersonation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Impersonation Form */}
      {!isImpersonating() && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Start Impersonation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Position to Impersonate
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value as PositionType)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {AVAILABLE_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will change your displayed position to the selected role
              </p>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impersonation Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Auto-revert after selected time
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Impersonation Warning
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Impersonating users should only be done for legitimate administrative purposes.
                  All actions taken while impersonating will be logged.
                  The original user will be notified when impersonation ends.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              onClick={handleImpersonate}
              disabled={!selectedPosition}
            >
              Start Impersonation
            </Button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {impersonationStatus && (
        <div className={`p-4 rounded-lg border ${
          impersonationStatus.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <p className={`font-medium ${
            impersonationStatus.success
              ? 'text-green-800 dark:text-green-300'
              : 'text-red-800 dark:text-red-300'
          }`}>
            {impersonationStatus.message}
          </p>
        </div>
      )}

      {/* Impersonation History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Impersonations
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Impersonation history will be displayed here. This feature is currently in development.
        </p>
      </div>
    </div>
  );
}
