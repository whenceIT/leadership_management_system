import { useState, useEffect } from 'react';
import { getKPIsByPosition } from '@/data/role-cards-data';
import { KpiMetric } from '@/data/role-cards-data';
import { useUserPosition } from '@/hooks/useUserPosition';
import type { PositionType } from '@/hooks/useUserPosition';

// Processed KPI interface for dashboard display
export interface ProcessedKPI {
  id: string;
  name: string;
  description: string;
  category: string;
  position: PositionType;
  target: number;
  baseline: number;
  weight: number;
  unit: string;
  frequency: string;
  isActive: boolean;
  lastUpdated: string;
  createdBy: string;
  value: number;
  format: string;
  lowerIsBetter?: boolean;
}

export function useUserKPI() {
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [processedKPIs, setProcessedKPIs] = useState<ProcessedKPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { positionName, isLoading: isPositionLoading, user, positionId } = useUserPosition();

  // Fetch KPIs from API when position changes (with caching)
  useEffect(() => {
    let isMounted = true;
    
    const fetchKpis = async () => {
      if (!positionName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all KPIs (cached on server)
        const response = await fetch('/api/kpi/all');

        if (!isMounted) return;

        const data = await response.json();

        if (response.ok) {
          // Filter KPIs by selected position on client side
          const allKpis = Array.isArray(data) ? data : [];
          
          // Transform API data to KpiMetric format
          const transformedKpis: KpiMetric[] = allKpis
            .filter((kpi: any) => kpi.position === positionName)
            .map((kpi: any, index: number) => ({
              id: kpi.id?.toString() || `kpi-${index}`,
              name: kpi.name || '',
              description: kpi.description || '',
              category: (kpi.category || 'operational') as any,
              position: positionName as PositionType,
              target: kpi.target?.toString() || '',
              baseline: kpi.baseline?.toString() || '',
              weight: parseInt(kpi.weight) || 0,
              unit: 'percent',
              frequency: 'monthly',
              isActive: true,
              lastUpdated: new Date().toISOString().split('T')[0],
              createdBy: 'API',
            }));
            
          setKpis(transformedKpis);
          
          // Process KPIs for dashboard display
          const processed = transformedKpis.map(kpi => {
            // Parse target, baseline, and value from strings with possible units (K, %, etc.)
            const parseMetricValue = (value: string, unit: string): number => {
              if (!value) return 0;
              
              let numericValue = 0;
              
              // Remove currency symbols, percentage signs, and other non-numeric characters
              const strippedValue = value.replace(/[^0-9.,]/g, '');
              
              // Parse as float
              numericValue = parseFloat(strippedValue);
              
              // Handle thousand (K) and million (M) suffixes
              if (value.includes('K')) numericValue *= 1000;
              if (value.includes('M')) numericValue *= 1000000;
              
              return numericValue;
            };

            const value = parseMetricValue(kpi.baseline, kpi.unit);
            const target = parseMetricValue(kpi.target, kpi.unit);
            const baseline = parseMetricValue(kpi.baseline, kpi.unit);

            return {
              id: kpi.id,
              name: kpi.name,
              description: kpi.description,
              category: kpi.category,
              position: kpi.position,
              target: target,
              baseline: baseline,
              weight: kpi.weight,
              unit: kpi.unit,
              frequency: kpi.frequency,
              isActive: kpi.isActive,
              lastUpdated: kpi.lastUpdated,
              createdBy: kpi.createdBy,
              value: value,
              format: kpi.unit === 'ZMW' ? 'currency' : kpi.unit === 'percent' ? 'percent' : 'number',
              lowerIsBetter: kpi.name.toLowerCase().includes('default') || kpi.name.toLowerCase().includes('cost'),
            };
          });
          
          setProcessedKPIs(processed);
        } else {
          // Fallback to local KPIs if API fails
          const localKpis = getKPIsByPosition(positionName as PositionType);
          setKpis(localKpis);
          
          const processed = localKpis.map(kpi => {
              // Parse target, baseline, and value from strings with possible units (K, %, etc.)
              const parseMetricValue = (value: string, unit: string): number => {
                if (!value) return 0;
                
                let numericValue = 0;
                
                // Remove currency symbols, percentage signs, and other non-numeric characters
                const strippedValue = value.replace(/[^0-9.,]/g, '');
                
                // Parse as float
                numericValue = parseFloat(strippedValue);
                
                // Handle thousand (K) and million (M) suffixes
                if (value.includes('K')) numericValue *= 1000;
                if (value.includes('M')) numericValue *= 1000000;
                
                return numericValue;
              };

              const value = parseMetricValue(kpi.baseline, kpi.unit);
              const target = parseMetricValue(kpi.target, kpi.unit);
              const baseline = parseMetricValue(kpi.baseline, kpi.unit);

              return {
                id: kpi.id,
                name: kpi.name,
                description: kpi.description,
                category: kpi.category,
                position: kpi.position,
                target: target,
                baseline: baseline,
                weight: kpi.weight,
                unit: kpi.unit,
                frequency: kpi.frequency,
                isActive: kpi.isActive,
                lastUpdated: kpi.lastUpdated,
                createdBy: kpi.createdBy,
                value: value,
                format: kpi.unit === 'ZMW' ? 'currency' : kpi.unit === 'percent' ? 'percent' : 'number',
                lowerIsBetter: kpi.name.toLowerCase().includes('default') || kpi.name.toLowerCase().includes('cost'),
              };
            });
          
          setProcessedKPIs(processed);
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        setError('Failed to fetch KPI data');
        // Fallback to local KPIs on error
        const localKpis = getKPIsByPosition(positionName as PositionType);
        setKpis(localKpis);
        
          const processed = localKpis.map(kpi => {
              // Parse target, baseline, and value from strings with possible units (K, %, etc.)
              const parseMetricValue = (value: string, unit: string): number => {
                if (!value) return 0;
                
                let numericValue = 0;
                
                // Remove currency symbols, percentage signs, and other non-numeric characters
                const strippedValue = value.replace(/[^0-9.,]/g, '');
                
                // Parse as float
                numericValue = parseFloat(strippedValue);
                
                // Handle thousand (K) and million (M) suffixes
                if (value.includes('K')) numericValue *= 1000;
                if (value.includes('M')) numericValue *= 1000000;
                
                return numericValue;
              };

              const value = parseMetricValue(kpi.baseline, kpi.unit);
              const target = parseMetricValue(kpi.target, kpi.unit);
              const baseline = parseMetricValue(kpi.baseline, kpi.unit);

              return {
                id: kpi.id,
                name: kpi.name,
                description: kpi.description,
                category: kpi.category,
                position: kpi.position,
                target: target,
                baseline: baseline,
                weight: kpi.weight,
                unit: kpi.unit,
                frequency: kpi.frequency,
                isActive: kpi.isActive,
                lastUpdated: kpi.lastUpdated,
                createdBy: kpi.createdBy,
                value: value,
                format: kpi.unit === 'ZMW' ? 'currency' : kpi.unit === 'percent' ? 'percent' : 'number',
                lowerIsBetter: kpi.name.toLowerCase().includes('default') || kpi.name.toLowerCase().includes('cost'),
              };
            });
        
        setProcessedKPIs(processed);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!isPositionLoading && positionName) {
      fetchKpis();
    }

    return () => {
      isMounted = false;
    };
  }, [positionName, isPositionLoading]);

  // Calculate overall score
  const getOverallScore = () => {
    if (processedKPIs.length === 0) return 0;
    
    const totalWeight = processedKPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
    if (totalWeight === 0) return 0;
    
    const weightedScore = processedKPIs.reduce((sum, kpi) => {
      // Calculate score for individual KPI
      const target = kpi.target;
      const value = kpi.value;
      
      let score = 0;
      if (kpi.lowerIsBetter) {
        // For metrics where lower is better
        if (value <= target) {
          score = 100;
        } else {
          score = Math.max(0, 100 - ((value - target) / target) * 100);
        }
      } else {
        // For metrics where higher is better
        score = Math.min(100, (value / target) * 100);
      }
      
      return sum + (score * kpi.weight);
    }, 0);
    
    return Math.round(weightedScore / totalWeight);
  };

  // Get unique categories
  const getCategories = () => {
    const categories = new Set<string>();
    processedKPIs.forEach(kpi => {
      if (kpi.category) {
        categories.add(kpi.category);
      }
    });
    return Array.from(categories);
  };

  // Refresh KPI data
  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/kpi/all');
      if (response.ok) {
        const data = await response.json();
        const allKpis = Array.isArray(data) ? data : [];
        
        const transformedKpis: KpiMetric[] = allKpis
          .filter((kpi: any) => kpi.position === positionName)
          .map((kpi: any, index: number) => ({
            id: kpi.id?.toString() || `kpi-${index}`,
            name: kpi.name || '',
            description: kpi.description || '',
            category: (kpi.category || 'operational') as any,
            position: positionName as PositionType,
            target: kpi.target?.toString() || '',
            baseline: kpi.baseline?.toString() || '',
            weight: parseInt(kpi.weight) || 0,
            unit: 'percent',
            frequency: 'monthly',
            isActive: true,
            lastUpdated: new Date().toISOString().split('T')[0],
            createdBy: 'API',
          }));
          
        setKpis(transformedKpis);
        
        const processed = transformedKpis.map(kpi => {
          // Parse target, baseline, and value from strings with possible units (K, %, etc.)
          const parseMetricValue = (value: string, unit: string): number => {
            if (!value) return 0;
            
            let numericValue = 0;
            
            // Remove currency symbols, percentage signs, and other non-numeric characters
            const strippedValue = value.replace(/[^0-9.,]/g, '');
            
            // Parse as float
            numericValue = parseFloat(strippedValue);
            
            // Handle thousand (K) and million (M) suffixes
            if (value.includes('K')) numericValue *= 1000;
            if (value.includes('M')) numericValue *= 1000000;
            
            return numericValue;
          };

          const value = parseMetricValue(kpi.baseline, kpi.unit);
          const target = parseMetricValue(kpi.target, kpi.unit);
          const baseline = parseMetricValue(kpi.baseline, kpi.unit);

          return {
            id: kpi.id,
            name: kpi.name,
            description: kpi.description,
            category: kpi.category,
            position: kpi.position,
            target: target,
            baseline: baseline,
            weight: kpi.weight,
            unit: kpi.unit,
            frequency: kpi.frequency,
            isActive: kpi.isActive,
            lastUpdated: kpi.lastUpdated,
            createdBy: kpi.createdBy,
            value: value,
            format: kpi.unit === 'ZMW' ? 'currency' : kpi.unit === 'percent' ? 'percent' : 'number',
            lowerIsBetter: kpi.name.toLowerCase().includes('default') || kpi.name.toLowerCase().includes('cost'),
          };
        });
        
        setProcessedKPIs(processed);
      }
    } catch (error) {
      console.error('Error refreshing KPIs:', error);
      setError('Failed to refresh KPI data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    kpis,
    processedKPIs,
    isLoading,
    error,
    userId: user?.id,
    jobPosition: positionId,
    refresh,
    getOverallScore,
    getCategories,
  };
}
