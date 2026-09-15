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
  role: string;
  isImpersonating: boolean;
}

/**
 * Get user data from localStorage
 * Returns the current user (impersonated or original)
 */
const USER_SESSION_KEY = 'thisUser';

export interface StoredUserData {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  office_id?: number;
  province_id?: number;
  role?: string;
  position_id?: number;
  job_position?: number;
  position?: string;
  tier?: string;
  status?: string;
  expiresAt?: number;
  [key: string]: any;
}

export function getUserData(): StoredUserData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedUser = localStorage.getItem(USER_SESSION_KEY);
    if (!storedUser) {
      return null;
    }

    const parsed = JSON.parse(storedUser) as StoredUserData;

    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
}

export function setUserData(userData: StoredUserData): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentData = getUserData();
  const expiresAt = userData.expiresAt ?? currentData?.expiresAt;
  const mergedData = {
    ...currentData,
    ...userData,
    ...(expiresAt ? { expiresAt } : {}),
  };

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(mergedData));
}

export function clearUserData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(USER_SESSION_KEY);
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
    role: 'executive',
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
      role: user.tier || getRoleFromJobPosition(user.job_position) || String(user.role || 'executive'),
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

/**
 * Maps a job_position integer ID to a hierarchical role string for API filtering.
 * Used to dynamically determine the user's role based on their position.
 */
const POSITION_ROLE_MAP: Record<number, string> = {
  1: 'executive',    // General Operations Manager (GOM)
  2: 'province',     // Provincial Manager
  3: 'district',     // District Regional Manager
  4: 'district',     // District Manager
  5: 'branch',       // Branch Manager
  16: 'executive',   // General Operations Administrator (GOA)
  20: 'executive',   // Executive Chairperson
  21: 'consultant',  // Loan Consultant
};

/**
 * Resolve a role string from a job_position integer ID.
 * Falls back to the provided default if not in the map.
 */
function getRoleFromJobPosition(jobPosition: number | undefined, fallback = 'executive'): string {
  if (jobPosition && POSITION_ROLE_MAP[jobPosition]) {
    return POSITION_ROLE_MAP[jobPosition];
  }
  return fallback;
}

/**
 * Get user role (supports impersonation)
 * Dynamically resolved from user.tier, then job_position, then defaults to 'executive'
 */
export function getUserRole(): string {
  const context = getUserContext();
  return context.role;
}

export default {
  getUserContext,
  getUserQueryParams,
  getUserQueryString,
  getUserId,
  getOfficeId,
  getProvinceId,
  getPositionId,
  getUserRole,
  isImpersonating,
  getImpersonationData,
  getUserData,
  getOriginalUserData,
};
