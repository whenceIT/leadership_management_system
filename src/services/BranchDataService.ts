export interface BranchInfo {
  id: number;
  name: string;
}

export interface Period {
  start_date: string;
  end_date: string;
}

// Active Loans Interface
export interface CurrentPeriodActiveLoans {
  active_loans_count: number;
  formatted_count: string;
  weekly_change: number;
  formatted_weekly_change: string;
  trend_direction: 'growth' | 'decline' | 'stable';
}

export interface OutstandingBalance {
  total_outstanding: number;
  principal_outstanding: number;
  interest_outstanding: number;
  fees_outstanding: number;
  penalty_outstanding: number;
  formatted_outstanding: string;
}

export interface Capacity {
  branch_capacity: number;
  utilization_percentage: number;
  remaining_capacity: number;
  status: 'available' | 'full' | 'over';
}

export interface StatusBreakdown {
  status: string;
  count: number;
  total_principal: number;
}

export interface ActiveLoansData {
  metric: string;
  office_id: number;
  office_name: string;
  current_period: CurrentPeriodActiveLoans;
  outstanding_balance: OutstandingBalance;
  capacity: Capacity;
  status_breakdown: StatusBreakdown[];
  product_breakdown?: any[];
  officer_breakdown?: any[];
  loan_details?: any[];
}

export interface ActiveLoansResponse {
  success: boolean;
  data: ActiveLoansData;
}

export interface ActiveLoansParams {
  office_id: number;
  include_details?: boolean;
  loan_officer_id?: number;
}

// Collection Rate Interface
export interface CurrentPeriodCollectionRate {
  total_collected: number;
  total_expected: number;
  collection_rate: number;
  formatted_rate: string;
  loans_with_payments: number;
  loans_with_due: number;
}

export interface PreviousPeriodCollectionRate {
  collection_rate: number;
  formatted_rate: string;
}

export interface CollectionBreakdown {
  principal: { collected: number; expected: number };
  interest: { collected: number; expected: number };
  fees: { collected: number; expected: number };
  penalty: { collected: number; expected: number };
}

export interface CollectionTrend {
  change_from_last_month: number;
  change_from_target: number;
  formatted_change: string;
  direction: 'improving' | 'declining' | 'stable';
}

export interface CollectionTarget {
  rate: number;
  status: 'exceeding_target' | 'meeting_target' | 'below_target';
  variance: number;
}

export interface CollectionRateData {
  metric: string;
  office_id: number;
  period: Period;
  current_period: CurrentPeriodCollectionRate;
  previous_period: PreviousPeriodCollectionRate;
  breakdown: CollectionBreakdown;
  trend: CollectionTrend;
  target: CollectionTarget;
  daily_trend?: any[];
  officer_performance?: any[];
}

export interface CollectionRateResponse {
  success: boolean;
  data: CollectionRateData;
}

export interface CollectionRateParams {
  office_id: number;
  period_start?: string;
  period_end?: string;
  target_rate?: number;
}

// Staff Productivity Interface
export interface CurrentPeriodProductivity {
  productivity_score: number;
  formatted_score: string;
  total_officers: number;
  improvement: number;
  formatted_improvement: string;
  trend_direction: 'improving' | 'declining' | 'stable';
}

export interface PreviousPeriodProductivity {
  start_date: string;
  end_date: string;
  productivity_score: number;
  formatted_score: string;
}

export interface KPIWeights {
  disbursement_target: { weight: string; description: string };
  collections_rate: { weight: string; description: string };
  portfolio_quality: { weight: string; description: string };
  client_acquisition: { weight: string; description: string };
}

export interface PerformanceSummary {
  average_disbursement_rate: number;
  average_collection_rate: number;
  average_par_rate: number;
  total_new_clients: number;
}

export interface PerformanceCategories {
  excellent: number;
  good: number;
  average: number;
  needs_improvement: number;
}

export interface Benchmark {
  target_score: number;
  status: 'on_target' | 'below_target' | 'above_target';
  variance_from_target: number;
}

export interface OfficerBreakdown {
  officer_id: number;
  officer_name: string;
  scores: {
    disbursement: { achievement_rate: number; weighted_score: number; weight: string };
    collections: { rate: number; weighted_score: number; weight: string };
    portfolio_quality: { par_30_rate: number; weighted_score: number; weight: string };
    client_acquisition: { new_clients: number; target: number; weighted_score: number; weight: string };
  };
  total_score: number;
  previous_score: number;
  change: number;
  rating: string;
}

export interface StaffProductivityData {
  metric: string;
  office_id: number;
  office_name: string;
  period: Period;
  current_period: CurrentPeriodProductivity;
  previous_period: PreviousPeriodProductivity;
  kpi_weights: KPIWeights;
  performance_summary: PerformanceSummary;
  performance_categories: PerformanceCategories;
  benchmark: Benchmark;
  officer_breakdown: OfficerBreakdown[];
  top_performers?: any[];
  needs_attention?: any[];
}

export interface StaffProductivityResponse {
  success: boolean;
  data: StaffProductivityData;
}

export interface StaffProductivityParams {
  office_id: number;
  period_start?: string;
  period_end?: string;
  include_officers?: boolean;
}

// Branch Stats Interface
export interface BranchStatsData {
  office_id: number;
  total_staff: number;
  staff_on_leave: number;
  pending_loans: number;
  disbursed_loans: number;
  active_clients: number;
  pending_advances: number;
  approved_advances: number;
  pending_expenses: number;
  open_tickets: number;
  loan_portfolio: string;
  pending_transactions: number;
}

export interface BranchStatsResponse {
  success: boolean;
  data: BranchStatsData;
}

export interface BranchStatsParams {
  office_id: number;
}

// Month-1 Default Rate Interface (we'll need to create this based on similar patterns)
export interface CurrentPeriodDefaultRate {
  default_rate: number;
  formatted_rate: string;
  change_from_last_month: number;
  formatted_change: string;
  trend_direction: 'improving' | 'declining' | 'stable';
}

export interface DefaultRateBreakdown {
  product: string;
  default_rate: number;
  count: number;
}

export interface Month1DefaultRateData {
  metric: string;
  office_id: number;
  office_name: string;
  current_period: CurrentPeriodDefaultRate;
  previous_period: {
    default_rate: number;
    formatted_rate: string;
  };
  breakdown: DefaultRateBreakdown[];
  target: {
    rate: number;
    status: 'below_target' | 'meeting_target' | 'above_target';
    variance: number;
  };
}

export interface Month1DefaultRateResponse {
  success: boolean;
  data: Month1DefaultRateData;
}

export interface Month1DefaultRateParams {
  office_id: number;
  period_start?: string;
  period_end?: string;
  target_rate?: number;
}

/**
 * BranchDataService manages fetching and caching of branch-specific metrics data.
 * 
 * DATA SOURCES:
 * - API: GET /active-loans
 * - API: GET /branch-stats
 * - API: GET /collections-rate
 * - API: GET /staff-productivity
 * - API: GET /month-1-default-rate (implied by requirement)
 * 
 * FEATURES:
 * - Singleton pattern for centralized data management
 * - Fetches various branch metrics
 * - Supports period-based filtering
 * - Provides caching for performance optimization
 */
export class BranchDataService {
  private static instance: BranchDataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance of BranchDataService
   */
  public static getInstance(): BranchDataService {
    if (!BranchDataService.instance) {
      BranchDataService.instance = new BranchDataService();
    }
    return BranchDataService.instance;
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(endpoint: string, params: any): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${paramString}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Clear cache for a specific endpoint or all
   */
  public clearCache(endpoint?: string, params?: any): void {
    if (endpoint) {
      // Clear cache entries for specific endpoint and parameters
      const cacheKey = this.getCacheKey(endpoint, params || {});
      this.cache.delete(cacheKey);
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Generic fetch method with caching
   */
  private async fetchData<T>(
    endpoint: string,
    params: any
  ): Promise<T | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(endpoint, params);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('BranchDataService: Returning cached data for', endpoint, params);
        return cached.data;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(
        `${API_BASE_URL}${endpoint}?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('BranchDataService: API request failed:', endpoint, response.status);
        return null;
      }

      const responseData: { success: boolean; data: T } = await response.json();
      
      if (responseData.success && responseData.data) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: responseData.data,
          timestamp: Date.now(),
        });
        
        console.log('BranchDataService: Fetched and cached data for', endpoint, params);
        return responseData.data;
      }

      return null;
    } catch (error) {
      console.error('BranchDataService: Error fetching data for', endpoint, error);
      return null;
    }
  }

  /**
   * Fetch active loans data
   */
  public async fetchActiveLoans(
    params: ActiveLoansParams
  ): Promise<ActiveLoansData | null> {
    return this.fetchData<ActiveLoansData>('/active-loans', params);
  }

  /**
   * Fetch branch stats
   */
  public async fetchBranchStats(
    params: BranchStatsParams
  ): Promise<BranchStatsData | null> {
    // Note: Branch stats has a different response structure without 'data' wrapper
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      
      const queryParams = new URLSearchParams();
      queryParams.append('office_id', String(params.office_id));

      const response = await fetch(
        `${API_BASE_URL}/branch-stats?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('BranchDataService: API request failed:', '/branch-stats', response.status);
        return null;
      }

      const responseData: BranchStatsResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        return responseData.data;
      }

      return null;
    } catch (error) {
      console.error('BranchDataService: Error fetching branch stats:', error);
      return null;
    }
  }

  /**
   * Fetch collection rate data
   */
  public async fetchCollectionRate(
    params: CollectionRateParams
  ): Promise<CollectionRateData | null> {
    return this.fetchData<CollectionRateData>('/collections-rate', params);
  }

  /**
   * Fetch staff productivity data
   */
  public async fetchStaffProductivity(
    params: StaffProductivityParams
  ): Promise<StaffProductivityData | null> {
    return this.fetchData<StaffProductivityData>('/staff-productivity', params);
  }

  /**
   * Fetch Month-1 default rate data
   */
  public async fetchMonth1DefaultRate(
    params: Month1DefaultRateParams
  ): Promise<Month1DefaultRateData | null> {
    return this.fetchData<Month1DefaultRateData>('/month-1-default-rate', params);
  }

  /**
   * Fetch all required metrics for branch manager dashboard
   */
  public async fetchBranchManagerMetrics(
    officeId: number,
    periodStart?: string,
    periodEnd?: string
  ): Promise<{
    activeLoans?: ActiveLoansData | null;
    branchStats?: BranchStatsData | null;
    collectionRate?: CollectionRateData | null;
    staffProductivity?: StaffProductivityData | null;
    month1DefaultRate?: Month1DefaultRateData | null;
  }> {
    const [
      activeLoans,
      branchStats,
      collectionRate,
      staffProductivity,
      month1DefaultRate
    ] = await Promise.all([
      this.fetchActiveLoans({ office_id: officeId }),
      this.fetchBranchStats({ office_id: officeId }),
      this.fetchCollectionRate({ 
        office_id: officeId, 
        period_start: periodStart, 
        period_end: periodEnd 
      }),
      this.fetchStaffProductivity({ 
        office_id: officeId, 
        period_start: periodStart, 
        period_end: periodEnd 
      }),
      this.fetchMonth1DefaultRate({ 
        office_id: officeId, 
        period_start: periodStart, 
        period_end: periodEnd 
      })
    ]);

    return {
      activeLoans,
      branchStats,
      collectionRate,
      staffProductivity,
      month1DefaultRate
    };
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

  /**
   * Format percentage with 1 decimal place
   */
  public formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Get trend indicator color based on direction
   */
  public getTrendColor(direction: 'improving' | 'declining' | 'stable' | 'growth' | 'decline'): string {
    if (direction === 'improving' || direction === 'growth') return 'text-green-600';
    if (direction === 'declining' || direction === 'decline') return 'text-red-600';
    return 'text-gray-600';
  }
}

export default BranchDataService;
