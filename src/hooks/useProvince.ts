'use client';

import { useState, useEffect, useCallback } from 'react';
import ProvinceService from '@/services/ProvinceService';
import type { Province } from '@/services/ProvinceService';

/**
 * useProvince Hook
 * Manages province data with caching and reactive updates
 */
export function useProvince() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provinceService = ProvinceService.getInstance();
      const data = await provinceService.getProvinces();
      setProvinces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching provinces:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  /**
   * Get province by ID
   */
  const getProvinceById = useCallback((id: number | undefined): Province | undefined => {
    if (!id) return undefined;
    return provinces.find(province => province.id === id);
  }, [provinces]);

  /**
   * Get province name by ID
   */
  const getProvinceName = useCallback((id: number | undefined): string => {
    const province = getProvinceById(id);
    return province?.name || 'Unknown Province';
  }, [getProvinceById]);

  /**
   * Get province ID by name
   */
  const getProvinceId = useCallback((name: string | undefined): number | null => {
    if (!name) return null;
    const province = provinces.find(province => 
      province.name.toUpperCase() === name.toUpperCase()
    );
    return province?.id || null;
  }, [provinces]);

  /**
   * Search provinces by name (case-insensitive)
   */
  const searchProvinces = useCallback((query: string): Province[] => {
    if (!query) return provinces;
    
    const searchTerm = query.toLowerCase();
    return provinces.filter(province => 
      province.name.toLowerCase().includes(searchTerm)
    );
  }, [provinces]);

  /**
   * Get sorted list of provinces (alphabetical order)
   */
  const getSortedProvinces = useCallback((): Province[] => {
    return [...provinces].sort((a, b) => a.name.localeCompare(b.name));
  }, [provinces]);

  return {
    provinces,
    isLoading,
    error,
    refetch: fetchProvinces,
    getProvinceById,
    getProvinceName,
    getProvinceId,
    searchProvinces,
    getSortedProvinces
  };
}

/**
 * Non-hook utility function for server-side or direct usage
 */
export async function fetchProvinces(): Promise<Province[]> {
  const provinceService = ProvinceService.getInstance();
  return provinceService.getProvinces();
}

export default useProvince;
