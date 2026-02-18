'use client';

/**
 * User Context Utility
 * Centralized utility for getting user context parameters
 * Supports impersonation - returns impersonated user data when active
 */

export interface UserContext {
  userId: number;
  officeId: number;
  provinceId: number;
  positionId: number;
  positionName: string;
  email: string;
  firstName: string;
  lastName: string;
  isImpersonating: boolean;
}

/**
 * Get user data from localStorage
 * Returns the current user (impersonated or original)
 */
export function getUserData(): Record<string, unknown> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) {
      return null;
    }
    return JSON.parse(storedUser);
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    return null;
  }
}

/**
 * Get original user data (before impersonation)
 */
export function getOriginalUserData(): Record<string, unknown> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check for original user data stored during impersonation
    const originalUser = localStorage.getItem('originalUserData') || 
                         localStorage.getItem('impersonatedFromUser');
    if (!originalUser) {
      return null;
    }
    return JSON.parse(originalUser);
  } catch (e) {
    return null;
  }
}

/**
 * Check if currently impersonating
 */
export function isImpersonating(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem('impersonatedFromUser') !== null ||
         localStorage.getItem('impersonationData') !== null;
}

/**
 * Get impersonation data if active
 */
export function getImpersonationData(): Record<string, unknown> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const impData = localStorage.getItem('impersonationData');
    if (!impData) return null;
    
    const data = JSON.parse(impData);
    
    // Check if expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      return null;
    }
    
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Get user context for API requests
 * Returns current user context (supports impersonation)
 */
export function getUserContext(): UserContext {
  const defaultContext: UserContext = {
    userId: 0,
    officeId: 0,
    provinceId: 0,
    positionId: 5, // Default to Branch Manager
    positionName: 'Branch Manager',
    email: '',
    firstName: '',
    lastName: '',
    isImpersonating: false,
  };

  if (typeof window === 'undefined') {
    return defaultContext;
  }

  try {
    const user = getUserData();
    const impersonating = isImpersonating();
    const impData = getImpersonationData();

    if (!user) {
      return defaultContext;
    }

    // If impersonating, use impersonation data for position
    const positionId = impersonating && impData?.positionId 
      ? Number(impData.positionId) 
      : Number(user.job_position || user.position_id || 5);

    const positionName = impersonating && impData?.positionName
      ? String(impData.positionName)
      : String(user.position || 'Branch Manager');

    return {
      userId: Number(user.id) || 0,
      officeId: Number(user.office_id) || 0,
      provinceId: Number(user.province_id || user.provinceId) || 0,
      positionId,
      positionName,
      email: String(user.email || ''),
      firstName: String(user.first_name || ''),
      lastName: String(user.last_name || ''),
      isImpersonating: impersonating,
    };
  } catch (e) {
    console.error('Error getting user context:', e);
    return defaultContext;
  }
}

/**
 * Get API query parameters for user context
 * Returns URLSearchParams with user_id, office_id, province_id
 */
export function getUserQueryParams(): URLSearchParams {
  const context = getUserContext();
  const params = new URLSearchParams();
  
  if (context.userId) {
    params.append('user_id', String(context.userId));
  }
  if (context.officeId) {
    params.append('office_id', String(context.officeId));
  }
  if (context.provinceId) {
    params.append('province_id', String(context.provinceId));
  }
  
  return params;
}

/**
 * Get user context as query string
 * Returns: `user_id=X&office_id=Y&province_id=Z`
 */
export function getUserQueryString(): string {
  const params = getUserQueryParams();
  return params.toString();
}

/**
 * Get user ID (supports impersonation)
 */
export function getUserId(): number {
  const context = getUserContext();
  return context.userId;
}

/**
 * Get office ID (supports impersonation)
 */
export function getOfficeId(): number {
  const context = getUserContext();
  return context.officeId;
}

/**
 * Get province ID (supports impersonation)
 */
export function getProvinceId(): number {
  const context = getUserContext();
  return context.provinceId;
}

/**
 * Get position ID (supports impersonation)
 */
export function getPositionId(): number {
  const context = getUserContext();
  return context.positionId;
}

export default {
  getUserContext,
  getUserQueryParams,
  getUserQueryString,
  getUserId,
  getOfficeId,
  getProvinceId,
  getPositionId,
  isImpersonating,
  getImpersonationData,
  getUserData,
  getOriginalUserData,
};
