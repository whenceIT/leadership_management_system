export interface ProvinceInfo {
  id: number;
  name: string;
}

export interface Period {
  start_date: string;
  end_date: string;
}

export interface ProvinceSummary {
  total_branches: number;
  active_branches: number;
  total_staff: number;
  total_net_contribution: number;
  formatted_net_contribution: string;
  total_portfolio: number;
  formatted_portfolio: string;
  total_active_loans: number;
  total_active_clients: number;
  average_par_rate: number;
  average_collection_rate: number;
}

export interface Portfolio {
  active_loans: number;
  active_clients: number;
  total_portfolio: number;
  formatted_portfolio: string;
}

export interface Disbursements {
  count: number;
  total: number;
  formatted: string;
}

export interface PAR {
  rate: number;
  par_balance: number;
}

export interface Collections {
  rate: number;
  collected: number;
  expected: number;
}

export interface BranchPerformance {
  rank: number;
  branch_id: number;
  branch_name: string;
  manager_name: string;
  net_contribution: string;
  net_contribution_value: number;
  portfolio: Portfolio;
  disbursements: Disbursements;
  par: PAR;
  collections: Collections;
  staff_count: number;
}

export interface ProvincialPerformanceData {
  metric: string;
  province: ProvinceInfo;
  period: Period;
  province_summary: ProvinceSummary;
  branches: BranchPerformance[];
}

export interface ProvincialPerformanceResponse {
  success: boolean;
  data: ProvincialPerformanceData;
}

export interface ProvincialPerformanceParams {
  province_id: number;
  period_start?: string;
  period_end?: string;
  include_details?: boolean;
}

/**
 * ProvincialDataService manages fetching and caching of provincial performance data.
 * 
 * DATA SOURCE:
 * - API: GET /province-branches-performance
 * 
 * FEATURES:
 * - Singleton pattern for centralized data management
 * - Fetches branch performance data for a specific province
 * - Supports period-based filtering
 * - Provides province-level summary and per-branch metrics
 */
export class ProvincialDataService {
  private static instance: ProvincialDataService;
  private cache: Map<string, { data: ProvincialPerformanceData; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance of ProvincialDataService
   */
  public static getInstance(): ProvincialDataService {
    if (!ProvincialDataService.instance) {
      ProvincialDataService.instance = new ProvincialDataService();
    }
    return ProvincialDataService.instance;
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(params: ProvincialPerformanceParams): string {
    return `${params.province_id}-${params.period_start || 'current'}-${params.period_end || 'current'}-${params.include_details || false}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Clear cache for a specific province or all
   */
  public clearCache(provinceId?: number): void {
    if (provinceId) {
      // Clear cache entries for specific province
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${provinceId}-`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Fetch provincial branches performance from API
   * API: GET /province-branches-performance?province_id=X
   */
  public async fetchProvincialPerformance(
    params: ProvincialPerformanceParams
  ): Promise<ProvincialPerformanceData | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(params);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('ProvincialDataService: Returning cached data for province', params.province_id);
        return cached.data;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('province_id', String(params.province_id));
      
      if (params.period_start) {
        queryParams.append('period_start', params.period_start);
      }
      if (params.period_end) {
        queryParams.append('period_end', params.period_end);
      }
      if (params.include_details) {
        queryParams.append('include_details', 'true');
      }

      const response = await fetch(
        `${API_BASE_URL}/province-branches-performance?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('ProvincialDataService: API request failed:', response.status);
        return null;
      }

      const responseData: ProvincialPerformanceResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: responseData.data,
          timestamp: Date.now(),
        });
        
        console.log('ProvincialDataService: Fetched and cached data for province', params.province_id);
        return responseData.data;
      }

      return null;
    } catch (error) {
      console.error('ProvincialDataService: Error fetching provincial performance:', error);
      return null;
    }
  }

  /**
   * Get province summary only (without detailed branch data)
   */
  public async getProvinceSummary(
    provinceId: number,
    periodStart?: string,
    periodEnd?: string
  ): Promise<ProvinceSummary | null> {
    const data = await this.fetchProvincialPerformance({
      province_id: provinceId,
      period_start: periodStart,
      period_end: periodEnd,
      include_details: false,
    });

    return data?.province_summary || null;
  }

  /**
   * Get branch performance data for a province
   */
  public async getBranchPerformance(
    provinceId: number,
    periodStart?: string,
    periodEnd?: string
  ): Promise<BranchPerformance[] | null> {
    const data = await this.fetchProvincialPerformance({
      province_id: provinceId,
      period_start: periodStart,
      period_end: periodEnd,
      include_details: true,
    });

    return data?.branches || null;
  }

  /**
   * Get health status for a branch based on performance metrics
   */
  public getBranchHealthStatus(branch: BranchPerformance): 'excellent' | 'good' | 'needs_focus' | 'critical' {
    const { par, collections, net_contribution_value } = branch;
    
    // Calculate health score based on PAR rate, collection rate, and net contribution
    let score = 0;
    
    // PAR rate scoring (lower is better)
    if (par.rate <= 2) score += 40;
    else if (par.rate <= 4) score += 30;
    else if (par.rate <= 6) score += 20;
    else score += 10;
    
    // Collection rate scoring (higher is better)
    if (collections.rate >= 95) score += 40;
    else if (collections.rate >= 90) score += 30;
    else if (collections.rate >= 85) score += 20;
    else score += 10;
    
    // Net contribution scoring (relative - based on rank)
    if (branch.rank === 1) score += 20;
    else if (branch.rank <= 2) score += 15;
    else if (branch.rank <= 3) score += 10;
    else score += 5;
    
    // Determine status
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs_focus';
    return 'critical';
  }

  /**
   * Format currency value to K format
   */
  public formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `K${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `K${(value / 1000).toFixed(0)}K`;
    }
    return `K${value}`;
  }
}

export default ProvincialDataService;
