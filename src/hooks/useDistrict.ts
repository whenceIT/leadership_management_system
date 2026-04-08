import { useState, useEffect, useCallback, useMemo } from 'react';

export interface District {
  id: number;
  name: string;
  province_id: number;
  offices_count?: number;
}

export function useDistrict() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistrictsWithOfficeCounts = async () => {
      try {
        setLoading(true);

        // Fetch districts
        const districtsResponse = await fetch('https://smartbackend.whencefinancesystem.com/districts');
        if (!districtsResponse.ok) {
          throw new Error('Failed to fetch districts');
        }
        const districtsData = await districtsResponse.json();
        const districtsList = Array.isArray(districtsData) ? districtsData : (districtsData.data || []);

        // Fetch offices to count by district
        try {
          const officesResponse = await fetch('https://smartbackend.whencefinancesystem.com/offices', {
            cache: "force-cache",
            next: { revalidate: 300 }
          });

          if (officesResponse.ok) {
            const officesData = await officesResponse.json();
            const offices = Array.isArray(officesData) ? officesData : (officesData.data || []);

            // Count offices by district
            const officeCounts: { [districtId: string]: number } = {};
            offices.forEach((office: any) => {
              const districtId = office.district_id || office.districtId;
              if (districtId) {
                const districtIdStr = districtId.toString();
                officeCounts[districtIdStr] = (officeCounts[districtIdStr] || 0) + 1;
              }
            });

            // Add office counts to districts
            const districtsWithCounts = districtsList.map((district: District) => ({
              ...district,
              offices_count: officeCounts[district.id.toString()] || 0
            }));

            setDistricts(districtsWithCounts);
          } else {
            // If offices fetch fails, use districts without counts
            setDistricts(districtsList.map((district: District) => ({
              ...district,
              offices_count: 0
            })));
          }
        } catch (officesError) {
          console.warn("Failed to fetch office counts for districts:", officesError);
          // Use districts without counts
          setDistricts(districtsList.map((district: District) => ({
            ...district,
            offices_count: 0
          })));
        }
      } catch (err) {
        console.error("Error fetching districts, falling back to empty:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictsWithOfficeCounts();
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
