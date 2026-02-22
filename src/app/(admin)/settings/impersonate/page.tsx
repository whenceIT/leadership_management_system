'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserPosition, ImpersonationData } from '@/hooks/useUserPosition';
import Button from '@/components/ui/button/Button';

interface LeadershipPosition {
  id: number;
  name: string;
  status: number;
  job_description: string;
  date_added: string;
}

interface StaffUser {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  job_position?: number;
  position_id?: number;
  status: string;
}

export default function ImpersonateProfilePage() {
  const {
    user,
    positionId: currentPositionId,
    positionName: currentPositionName,
    positions,
    isLoading,
    refreshPositions,
    startImpersonation,
    cancelImpersonation,
    isImpersonating,
    getImpersonationData,
    getOriginalUser
  } = useUserPosition();

  const [selectedPositionId, setSelectedPositionId] = useState<number>(5);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [impersonationStatus, setImpersonationStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [currentImpersonation, setCurrentImpersonation] = useState<ImpersonationData | null>(null);
  
  // State for users fetched from API
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Fetch users by position from API
  const fetchUsersByPosition = useCallback(async (positionId: number) => {
    setIsLoadingUsers(true);
    setUsersError(null);
    
    try {
      const response = await fetch(`https://smartbackend.whencefinancesystem.com/staffbyPosition?position_id=${positionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setStaffUsers(data);
        // Auto-select first user if available
        if (data.length > 0) {
          setSelectedUserId(data[0].id);
        } else {
          setSelectedUserId(null);
        }
      } else {
        setStaffUsers([]);
        setSelectedUserId(null);
      }
    } catch (error) {
      console.error('Error fetching staff users:', error);
      setUsersError(error instanceof Error ? error.message : 'Failed to fetch users');
      setStaffUsers([]);
      setSelectedUserId(null);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Check for impersonation status on mount
  useEffect(() => {
    if (isImpersonating()) {
      const impData = getImpersonationData();
      if (impData) {
        setCurrentImpersonation(impData);
        const originalUser = getOriginalUser();
        if (originalUser) {
          setImpersonationStatus({
            success: true,
            message: `Currently impersonating ${impData.userName} (${impData.positionName}). Original user: ${originalUser.first_name} ${originalUser.last_name}`
          });
        }
      }
    }
  }, [isImpersonating, getImpersonationData, getOriginalUser]);

  // Refresh positions from API on mount to ensure we have the latest positions
  useEffect(() => {
    refreshPositions();
  }, [refreshPositions]);

  // Fetch users when position changes
  useEffect(() => {
    if (selectedPositionId && !isImpersonating()) {
      fetchUsersByPosition(selectedPositionId);
    }
  }, [selectedPositionId, fetchUsersByPosition, isImpersonating]);

  const handleImpersonate = () => {
    setImpersonationStatus(null);
    
    const selectedUser = staffUsers.find(u => u.id === selectedUserId);
    if (!selectedUser) {
      setImpersonationStatus({
        success: false,
        message: 'Please select a valid user to impersonate'
      });
      return;
    }

    // Get user's full name and parse into first_name and last_name
    const fullName = getUserFullName(selectedUser);
    const nameParts = fullName.split(' ').filter(Boolean);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const result = startImpersonation(
      { id: selectedUser.id, first_name: firstName, last_name: lastName, email: selectedUser.email || '' },
      selectedPositionId,
      duration
    );

    setImpersonationStatus({
      success: result.success,
      message: result.message
    });

    if (result.success) {
      const impData = getImpersonationData();
      if (impData) {
        setCurrentImpersonation(impData);
      }
    }
  };

  const handleCancelImpersonation = () => {
    const success = cancelImpersonation();
    if (success) {
      setCurrentImpersonation(null);
      setImpersonationStatus({
        success: true,
        message: 'Impersonation cancelled. Reverted to original user.'
      });
    }
  };

  // Get selected position name for display
  const selectedPositionName = positions.find(p => p.id === selectedPositionId)?.name || 'Branch Manager';
  
  // Get selected user for display
  const selectedUser = staffUsers.find(u => u.id === selectedUserId);
  
  // Helper function to get user's full name
  const getUserFullName = (user: StaffUser | undefined): string => {
    if (!user) return 'Unknown User';
    // If first_name and last_name are provided, use them
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
    }
    // Otherwise use the name field
    return user.name || 'Unknown User';
  };

  // Calculate remaining time for impersonation
  const getRemainingTime = (): string => {
    if (!currentImpersonation) return '';
    const remaining = currentImpersonation.expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
            <p className="font-medium text-brand-500">{currentPositionId} - {currentPositionName}</p>
          </div>
        </div>

        {isImpersonating() && currentImpersonation && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  🎭 You are currently impersonating
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  <strong>{currentImpersonation.userName}</strong> ({currentImpersonation.positionName})
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                  Time remaining: {getRemainingTime()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCancelImpersonation}
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Position to Impersonate
              </label>
              <select
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {positions.map((pos: LeadershipPosition) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.id} - {pos.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Position: {selectedPositionName}
              </p>
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select User to Impersonate
              </label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                disabled={isLoadingUsers}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
              >
                {isLoadingUsers ? (
                  <option value="">Loading users...</option>
                ) : staffUsers.length === 0 ? (
                  <option value="">No users available for this position</option>
                ) : (
                  staffUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {getUserFullName(u)} ({u.email})
                    </option>
                  ))
                )}
              </select>
              {isLoadingUsers && (
                <p className="mt-2 text-sm text-blue-500 flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                  Fetching users...
                </p>
              )}
              {usersError && (
                <p className="mt-2 text-sm text-red-500">
                  Error: {usersError}
                </p>
              )}
              {!isLoadingUsers && !usersError && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser ? `User ID: ${selectedUser.id} | Status: ${selectedUser.status}` : 'Select a position first'}
                </p>
              )}
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
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

          {/* Selected User Preview */}
          {selectedUser && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
                Impersonation Preview
              </h4>
              <div className="flex items-start gap-4">
                {/* User Profile Image Placeholder with Pulse Animation */}
                <div className="flex-shrink-0">
                  <style jsx>{`
                    @keyframes pulse-glow {
                      0%, 100% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                      }
                      50% {
                        box-shadow: 0 0 20px 10px rgba(59, 130, 246, 0.2);
                      }
                    }
                    .avatar-pulse {
                      animation: pulse-glow 2s ease-in-out;
                      animation-delay: 5s;
                      animation-iteration-count: infinite;
                    }
                  `}</style>
                  <div className="avatar-pulse w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {selectedUser.first_name?.charAt(0)?.toUpperCase() || selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                {/* User Details */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">User</p>
                    <p className="font-medium text-blue-800 dark:text-blue-300">{getUserFullName(selectedUser)}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Email</p>
                    <p className="font-medium text-blue-800 dark:text-blue-300">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Position</p>
                    <p className="font-medium text-blue-800 dark:text-blue-300">{selectedPositionName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Duration</p>
                    <p className="font-medium text-blue-800 dark:text-blue-300">{duration} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              disabled={!selectedPositionId || !selectedUserId || isLoadingUsers}
            >
              {isLoadingUsers ? 'Loading Users...' : 'Start Impersonation'}
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

      {/* Available Users for Selected Position */}
      {!isImpersonating() && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Users for {selectedPositionName}
          </h3>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
              <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
          ) : usersError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading users: {usersError}</p>
              <button 
                onClick={() => fetchUsersByPosition(selectedPositionId)}
                className="mt-2 text-brand-500 hover:text-brand-600"
              >
                Try again
              </button>
            </div>
          ) : staffUsers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No users found for this position. Select a different position to see available users.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {staffUsers.map((u) => (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        selectedUserId === u.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                      }`}
                      onClick={() => setSelectedUserId(u.id)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{u.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{getUserFullName(u)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.status === 'Active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Users fetched from API: GET /staffbyPosition?position_id={selectedPositionId}
          </p>
        </div>
      )}
    </div>
  );
}
