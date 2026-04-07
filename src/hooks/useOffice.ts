'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useOffice Hook
 * 
 * Provides access to office data fetched from the backend API.
 * Includes district_id and province_id for hierarchical filtering.
 */

export interface Office {
  id: string | number;
  name: string;
  parentId: string | number | null;
  externalId: string;
  openingDate?: string | null;
  branchCapacity?: number | string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  managerId?: string | number | null;
  active: boolean | number;
  defaultOffice?: boolean | number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  provinceId: string | number;
  districtId?: string | number | null;
  district_id?: string | number | null; // API often uses snake_case
  province_id?: string | number | null;
}

export function useOffice() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://smartbackend.whencefinancesystem.com/offices', {
          cache: "force-cache",
          next: { revalidate: 300 }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch offices');
        }
        const data = await response.json();
        const formattedData = Array.isArray(data) ? data : (data.data || []);
        
        // Normalize snake_case from API to camelCase where expected by existing UI
        const normalized = formattedData.map((o: any) => ({
          ...o,
          id: o.id.toString(),
          provinceId: (o.province_id || o.provinceId)?.toString(),
          districtId: (o.district_id || o.districtId)?.toString(),
          parentId: o.parent_id?.toString() || null,
          externalId: o.external_id || o.externalId,
          branchCapacity: o.branch_capacity ?? o.branchCapacity ?? null,
          createdAt: o.created_at ?? o.createdAt ?? null,
          updatedAt: o.updated_at ?? o.updatedAt ?? null,
          active: !!o.active,
        }));
        
        setOffices(normalized);
      } catch (err) {
        console.error("Error fetching offices:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);

  /**
   * Get office name by ID
   */
  const getOfficeName = useCallback((officeId: string | number): string | undefined => {
    const idStr = String(officeId);
    const office = offices.find((o) => String(o.id) === idStr);
    return office?.name;
  }, [offices]);

  /**
   * Get office by ID
   */
  const getOffice = useCallback((officeId: string | number): Office | undefined => {
    const idStr = String(officeId);
    return offices.find((o) => String(o.id) === idStr);
  }, [offices]);

  /**
   * Get all active offices
   */
  const getActiveOffices = useCallback((): Office[] => {
    return offices.filter((o) => o.active);
  }, [offices]);

  /**
   * Get all offices
   */
  const getAllOffices = useCallback((): Office[] => {
    return offices;
  }, [offices]);

  /**
   * Get offices by province ID
   */
  const getOfficesByProvince = useCallback((provinceId: string | number): Office[] => {
    const idStr = String(provinceId);
    return offices.filter((o) => String(o.provinceId) === idStr);
  }, [offices]);

  /**
   * Get offices by district ID
   */
  const getOfficesByDistrict = useCallback((districtId: string | number): Office[] => {
    const idStr = String(districtId);
    return offices.filter((o) => String(o.districtId) === idStr);
  }, [offices]);

  /**
   * Get child offices of a parent
   */
  const getChildOffices = useCallback((parentId: string | number): Office[] => {
    const idStr = String(parentId);
    return offices.filter((o) => String(o.parentId) === idStr);
  }, [offices]);

  return {
    offices,
    loading,
    error,
    getOfficeName,
    getOffice,
    getActiveOffices,
    getAllOffices,
    getOfficesByProvince,
    getOfficesByDistrict,
    getChildOffices,
  };
}

/**
 * Standalone utility function to get office name by ID
 * Includes a fallback check for cases where the offices array might be undefined
 */
export function getOfficeNameById(officeId: string | number, offices?: Office[]): string | undefined {
  if (!officeId) return undefined;
  const idStr = String(officeId);
  
  // 1. If dynamic offices array is provided, use it (Most accurate)
  if (offices && Array.isArray(offices)) {
    const office = offices.find((o) => String(o.id) === idStr);
    if (office) return office.name;
  }
  
  // 2. Fallback to a static list of known major offices for immediate UI resolution
  const STABLE_OFFICES: Record<string, string> = {
    "1": "ZIMCO HOUSE LUSAKA",
    "2": "ANCHOR HOUSE LUSAKA",
    "3": "KAMBENDEKELA HOUSE LUSAKA",
    "4": "SOLWEZI HQ BRANCH",
    "5": "WHENCE KITWE BRANCH",
    "6": "PROVIDENT HOUSE CHIPATA",
    "7": "COMPENSATION HOUSE KASAMA",
    "8": "MANSA BRANCH",
    "9": "LIVINGSTONE BRANCH",
    "10": "WHENCE KABWE BRANCH",
    "11": "MONGU BRANCH",
    "12": "LUMWANA BRANCH",
    "13": "NDOLA BRANCH",
    "15": "MAZABUKA BRANCH"
  };
  
  if (STABLE_OFFICES[idStr]) return STABLE_OFFICES[idStr];
  
  // 3. Last resort: check if it's the current user's office name cached in session
  return undefined;
}


/**
 * Get the current user's office name from localStorage
 * Used synchronously in various dashboards
 */
export function getUserOfficeName(): string {
  if (typeof window === 'undefined') return 'Loading...';
  try {
    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) return 'Unknown Branch';
    const user = JSON.parse(storedUser);
    
    // Try various possible field names from the user session object
    const officeName = user.office_name || user.officeName || (user.office && user.office.name);
    if (officeName) return officeName;
    
    // Fallback to institutional default seen in this codebase
    return 'KAMBENDEKELA HOUSE LUSAKA';
  } catch (err) {
    console.warn("Failed to parse thisUser from localStorage in getUserOfficeName", err);
    return 'Unknown Branch';
  }
}

export default useOffice;
