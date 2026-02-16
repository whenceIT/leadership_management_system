"use client";
import React, { useEffect, useState } from "react";
import { useUserSync } from "../../hooks/useUserSync";
import { useUserPosition } from "../../hooks/useUserPosition";
import { getOfficeNameById, getOfficeById } from "../../hooks/useOffice";
import Image from "next/image";

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: string;
  office_id?: number;
  status?: string;
  job_position?: number;
  position_id?: number;
  position?: string;
  employee_number?: string;
  role_id?: number;
  province_id?: number;
  [key: string]: any;
}

export default function UserRoleCard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Use the sync hook to keep user data up to date
  useUserSync();
  
  // Get position from useUserPosition hook
  const { positionName, positionId } = useUserPosition();
  
  // Get office data
  const getOfficeDetails = () => {
    if (userData?.office_id) {
      return getOfficeById(userData.office_id);
    }
    return null;
  };
  
  const officeDetails = getOfficeDetails();
  
  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('thisUser');
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
    };
    
    // Read initial data
    handleStorageChange();
    
    // Listen for storage events (when localStorage is updated in other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const fullName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}` : 'User';
  const officeName = userData?.office_id ? getOfficeNameById(userData.office_id) || `Office #${userData.office_id}` : 'Not assigned';
  
  // Get leadership hierarchy based on position
  const getLeadershipHierarchy = () => {
    const hierarchies: { [key: number]: string[] } = {
      1: ['Board of Directors', 'Managing Director', 'General Operations Manager (GOM)'],
      2: ['General Operations Manager (GOM)', 'Provincial Manager'],
      3: ['Provincial Manager', 'District Regional Manager'],
      4: ['District Regional Manager', 'District Manager'],
      5: ['District Manager', 'Branch Manager'],
      6: ['IT Director', 'IT Manager'],
      7: ['Managing Director', 'Risk Manager'],
      8: ['Managing Director', 'Management Accountant'],
      9: ['GOM', 'Motor Vehicles Manager'],
      10: ['GOM', 'Payroll Loans Manager'],
      11: ['GOM', 'Policy & Training Manager'],
      12: ['GOM', 'Manager Administration'],
      13: ['GOM', 'R&D Coordinator'],
      14: ['GOM', 'Recoveries Coordinator'],
      15: ['IT Manager', 'IT Coordinator'],
      16: ['GOM', 'GOA'],
      17: ['GOM', 'POA'],
      18: ['Marketing Director', 'Creative Artwork Manager'],
      20: ['Board of Directors', 'Super Seer'],
    };
    
    return hierarchies[positionId] || ['Organization'];
  };
  
  const hierarchy = getLeadershipHierarchy();
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-gradient-to-br from-brand-500/5 to-brand-600/10">
      {/* Header with Avatar and Basic Info */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-lg">
            <Image
              width={80}
              height={80}
              src="/images/user/owner.jpg"
              alt={fullName}
              className="object-cover w-full h-full"
            />
            {/* Status Indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          {/* Name and Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {userData?.email || 'No email'}
            </p>
            
            {/* Status Badge */}
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
                {userData?.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex lg:flex-col gap-4 lg:gap-2">
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white">#{userData?.id || 'N/A'}</p>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Employee #</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white">{userData?.employee_number || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
      
      {/* Job Card Details - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Position Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Position</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{positionName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Position ID: {positionId}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Role ID: {userData?.role_id || 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Office Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Office / Branch</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{officeName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Office ID: {userData?.office_id || 'N/A'}
            </span>
            {officeDetails?.externalId && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                Code: {officeDetails.externalId}
              </span>
            )}
          </div>
        </div>
        
        {/* Province Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Province</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {userData?.province_id === 1 ? 'Lusaka' : 
                 userData?.province_id === 2 ? 'Copperbelt' :
                 userData?.province_id === 3 ? 'Eastern' :
                 userData?.province_id === 4 ? 'Central' :
                 userData?.province_id === 6 ? 'Northern' :
                 userData?.province_id === 7 ? 'North-Western' :
                 userData?.province_id === 8 ? 'Western' :
                 userData?.province_id === 9 ? 'Southern' :
                 userData?.province_id === 10 ? 'Luapula' : 'Unknown'}
              </p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Province ID: {userData?.province_id || 'N/A'}
          </span>
        </div>
        
        {/* Phone Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{userData?.phone || 'Not provided'}</p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            {userData?.phone ? 'Verified' : 'Not verified'}
          </span>
        </div>
      </div>
      
      {/* Leadership Organization Structure */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Leadership Organization Structure</h4>
        </div>
        
        {/* Hierarchy Visualization */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-1">
            {hierarchy.map((level, index) => (
              <React.Fragment key={index}>
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  index === hierarchy.length - 1 
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border-2 border-brand-500' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {level}
                </div>
                {index < hierarchy.length - 1 && (
                  <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Last updated: Just now</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}
