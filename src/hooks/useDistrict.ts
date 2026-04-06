import { useState, useEffect, useCallback, useMemo } from 'react';

export interface District {
  id: number;
  name: string;
  province_id: number;
}

export function useDistrict() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://smartbackend.whencefinancesystem.com/districts');
        if (!response.ok) {
          throw new Error('Failed to fetch districts');
        }
        const data = await response.json();
        setDistricts(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error("Error fetching districts, falling back to empty:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  const getDistrictsByProvince = useCallback((provinceId: number) => {
    return districts.filter(d => 
      d.province_id === provinceId || 
      d.province_id.toString() === provinceId.toString()
    );
  }, [districts]);

  const getDistrictName = useCallback((districtId: number) => {
    const district = districts.find(d => 
      d.id === districtId || 
      d.id.toString() === districtId.toString()
    );
    return district ? district.name : `District ${districtId}`;
  }, [districts]);

  return { districts, getDistrictsByProvince, getDistrictName, loading, error };
}
