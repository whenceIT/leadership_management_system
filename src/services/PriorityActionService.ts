'use client';

import { LoanData } from '@/hooks/useLoanUpdates';
import { getPositionNameByIdStatic } from '@/hooks/useUserPosition';
import {
  POSITION_IDS,
  LOAN_THRESHOLDS,
  generatePositionSpecificActions,
  generateStaleLoanSummaryAction,
  LoanActionContext,
} from '@/utils/loanActionGenerator';
import { getUserContext, UserContext } from '@/utils/userContext';

// Re-export POSITION_IDS and LOAN_THRESHOLDS for backward compatibility
export { POSITION_IDS, LOAN_THRESHOLDS };

export interface PriorityAction {
  id?: number;
  action: string;
  due: string;
  urgent: boolean;
  status?: number;
  position_id?: number;
  user_id?: number;
  office_id?: number;
  positionSpecific?: boolean;
  targetPositionIds?: number[];
  created_date?: string;
  updated_at?: string;
}

export interface PriorityActionResult {
  priorityActions: PriorityAction[];
  newActionsAdded: number;
}

// Callback type for priority action updates
export type PriorityActionCallback = (actions: PriorityAction[]) => void;

/**
 * PriorityActionService manages priority actions for the Leadership Assistant.
 * 
 * DATA SOURCE:
 * - Initializes from API: GET /smart-loans?status=pending&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * - Real-time updates via WebSocket events (loan.created)
 * 
 * RESPONSIBILITY WORKFLOW:
 * - Generates position-specific actions based on user's current position
 * - Supports impersonation - uses impersonated position when active
 * 
 * Uses centralized loanActionGenerator for position-specific action logic
 */
export class PriorityActionService {
  private static instance: PriorityActionService;
  private priorityActions: PriorityAction[] = [];
  private newActions: PriorityAction[] = [];
  private loanCount: number = 0;
  private subscribers: Set<PriorityActionCallback> = new Set();
  private isInitialized: boolean = false;
  private currentPositionId: number = 5; // Default to Branch Manager
  private initializationPromise: Promise<void> | null = null;
  private userContext: UserContext | null = null;

  private constructor() {
    // Get current position (including impersonation)
    this.refreshCurrentPosition();
  }

  /**
   * Refresh user context and position
   */
  private refreshUserContext(): void {
    this.userContext = getUserContext();
    this.currentPositionId = this.userContext.positionId;
    console.log('PriorityActionService: User context refreshed:', {
      userId: this.userContext.userId,
      officeId: this.userContext.officeId,
      provinceId: this.userContext.provinceId,
      positionId: this.currentPositionId,
      positionName: this.userContext.positionName,
      isImpersonating: this.userContext.isImpersonating,
    });
  }

  /**
   * Get current position ID from user context
   */
  private getCurrentPositionId(): number {
    this.refreshUserContext();
    return this.currentPositionId;
  }

  /**
   * Refresh the current position ID (call when impersonation changes)
   */
  public refreshCurrentPosition(): void {
    this.refreshUserContext();
    console.log('PriorityActionService: Current position ID:', this.currentPositionId, 
      `(${getPositionNameByIdStatic(this.currentPositionId)})`);
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Initialize from API - fetch priority actions for current user
   * API: GET /smart-priority-actions?user_id=X&office_id=Y&province_id=Z&status=0
   */
  public async initializeFromAPI(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return
    if (this.isInitialized) {
      return;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  /**
   * Internal initialization method
   */
  private async doInitialize(): Promise<void> {
    try {
      console.log('PriorityActionService: Initializing from API...');
      
      // Refresh user context first
      this.refreshUserContext();
      
      if (!this.userContext) {
        console.error('PriorityActionService: No user context available');
        this.isInitialized = true;
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      
      // Get today's date for filtering
      const today = new Date();
      const todayStr = this.formatDate(today);
      
      // Build query parameters for pending loans (today's actions)
      const loansParams = new URLSearchParams();
      loansParams.append('status', 'pending');
      loansParams.append('start_date', todayStr);
      loansParams.append('end_date', todayStr);
      
      if (this.userContext.officeId) {
        loansParams.append('office_id', String(this.userContext.officeId));
      }
      if (this.userContext.provinceId) {
        // loansParams.append('province_id', String(this.userContext.provinceId));
      }
      
      // Fetch pending loans from API
      const loansResponse = await fetch(
        `${API_BASE_URL}/smart-loans?${loansParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      let pendingLoans: any[] = [];
      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        if (loansData.success && Array.isArray(loansData.data)) {
          pendingLoans = loansData.data;
        } else if (Array.isArray(loansData)) {
          pendingLoans = loansData;
        } else if (loansData.data && Array.isArray(loansData.data)) {
          pendingLoans = loansData.data;
        }
        console.log('PriorityActionService: Fetched', pendingLoans.length, 'pending loans from API');
      } else {
        console.error('PriorityActionService: Failed to fetch pending loans:', loansResponse.status);
      }
      
      // Process pending loans through the centralized action generator
      const allItems = pendingLoans;
      console.log('PriorityActionService: Total items to process:', allItems.length);

      // Process each item through the centralized action generator
      // This ensures all actions flow through the RESPONSIBILITY WORKFLOW
      this.priorityActions = [];
      const context: LoanActionContext = {
        currentPositionId: this.currentPositionId,
        loanCount: 0,
        isStaleLoan: false,
      };

      for (const item of allItems) {
        // Convert API item to LoanData format for the generator
        const loanData: LoanData = {
          id: item.id || item.loan_id,
          amount: item.amount || item.principal || 0,
          client: item.client || item.borrower_name || 'Unknown Client',
          borrower_name: item.borrower_name || item.client || 'Unknown Client',
          loan_number: item.loan_number || item.external_id || `LOAN-${item.id}`,
          status: item.status || 'pending',
          created_by: item.created_by || item.created_by_id || 'Unknown',
          office_id: item.office_id || 0,
          type: item.type || item.loan_type || 'New Loan',
          created_at: item.created_date || item.created_at,
        };

        // Use centralized action generator
        const generatedActions = generatePositionSpecificActions(loanData, context);
        
        // Add the generated actions to our list
        for (const action of generatedActions) {
          this.priorityActions.push({
            ...action,
            id: item.id,
            status: item.status,
            position_id: item.position_id,
            user_id: item.user_id,
            office_id: item.office_id,
            created_date: item.created_date || item.created_at,
            updated_at: item.updated_at,
          });
        }
        
        // Increment loan count for context
        context.loanCount++;
      }

      // Set loan count based on processed items
      this.loanCount = allItems.length;

      this.isInitialized = true;
      
      // Notify subscribers
      this.notifySubscribers();
      
      console.log('PriorityActionService: Initialized with', this.priorityActions.length, 'actions');
    } catch (error) {
      console.error('PriorityActionService: Error initializing from API:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Get singleton instance of PriorityActionService
   */
  public static getInstance(): PriorityActionService {
    if (!PriorityActionService.instance) {
      PriorityActionService.instance = new PriorityActionService();
    }
    return PriorityActionService.instance;
  }

  /**
   * Subscribe to priority action updates
   * @param callback - Function to call when priority actions are updated
   * @returns Unsubscribe function
   */
  public subscribe(callback: PriorityActionCallback): () => void {
    this.subscribers.add(callback);
    console.log('PriorityActionService: Subscriber added. Total:', this.subscribers.size);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      console.log('PriorityActionService: Subscriber removed. Total:', this.subscribers.size);
    };
  }

  /**
   * Notify all subscribers about priority action updates
   */
  private notifySubscribers(): void {
    const currentActions = [...this.priorityActions];
    this.subscribers.forEach(callback => {
      try {
        callback(currentActions);
      } catch (error) {
        console.error('PriorityActionService: Error notifying subscriber:', error);
      }
    });
    console.log('PriorityActionService: Notified', this.subscribers.size, 'subscribers');
  }

  /**
   * Fetch loans pending for more than specified days from API
   * @param daysOld - Minimum days a loan should be pending (default: 3)
   * @returns Array of stale loan data
   */
  private async fetchStaleLoans(daysOld: number = 3): Promise<LoanData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      
      // Calculate date range: loans created before (today - daysOld)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (daysOld + 30)); // Look back 30+ days
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - daysOld);
      
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);
      
      const response = await fetch(
        `${API_BASE_URL}/smart-loans?status=pending&start_date=${startDateStr}&end_date=${endDateStr}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('PriorityActionService: Failed to fetch stale loans:', response.status);
        return [];
      }

      const responseData = await response.json();
      
      // Handle different API response formats
      let loans: LoanData[] = [];
      if (Array.isArray(responseData)) {
        loans = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        loans = responseData.data;
      } else if (responseData.loans && Array.isArray(responseData.loans)) {
        loans = responseData.loans;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        loans = responseData.items;
      } else {
        console.warn('PriorityActionService: Unexpected API response format:', typeof responseData);
        return [];
      }
      
      console.log('PriorityActionService: Fetched stale loans from API (pending > ' + daysOld + ' days):', loans.length);
      
      return loans;
    } catch (error) {
      console.error('PriorityActionService: Error fetching stale loans:', error);
      return [];
    }
  }

  /**
   * Add priority actions for loans that have been pending for more than specified days
   * This function is called to proactively identify stale loans (e.g., when socket breaks)
   * Uses centralized loanActionGenerator for position-specific actions
   */
  public async checkStaleLoans(): Promise<number> {
    // Refresh position in case impersonation changed
    this.refreshCurrentPosition();
    
    const staleLoans = await this.fetchStaleLoans(3);
    
    if (!staleLoans || staleLoans.length === 0) {
      return 0;
    }

    // Initialize newActions for this batch
    this.newActions = [];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    console.log('PriorityActionService: Processing', staleLoans.length, 'stale loans through centralized action generator');

    // Process each stale loan through the centralized RESPONSIBILITY WORKFLOW
    for (const loan of staleLoans) {
      const context: LoanActionContext = {
        currentPositionId: this.currentPositionId,
        loanCount: this.loanCount,
        isStaleLoan: true,
      };
      
      // Use centralized action generator
      const loanActions = generatePositionSpecificActions(loan, context);
      this.newActions.push(...loanActions);
    }

    // Add summary action at the beginning
    const summaryAction = generateStaleLoanSummaryAction(staleLoans, timeStr);
    this.newActions.unshift(summaryAction as PriorityAction);

    // Add new actions to priority actions
    const newActionsCount = this.newActions.length;
    this.priorityActions = [...this.newActions, ...this.priorityActions];
    
    // Clear the global newActions array after processing
    this.newActions = [];

    // Keep the list manageable - max 15 actions for stale loans
    if (this.priorityActions.length > 15) {
      this.priorityActions = this.priorityActions.slice(0, 15);
    }

    // Notify subscribers
    if (newActionsCount > 0) {
      this.notifySubscribers();
    }

    console.log('PriorityActionService: Added', newActionsCount, 'stale loan actions through centralized generator');
    return newActionsCount;
  }

  /**
   * Process a new loan and generate relevant priority actions
   * RESPONSIBILITY WORKFLOW: Uses centralized loanActionGenerator for position-specific actions
   * @param loanData - The newly created loan data
   * @returns The result containing generated priority actions
   */
  public processNewLoan(loanData: LoanData): PriorityActionResult {
    this.loanCount++;
    // Refresh position in case impersonation changed
    this.refreshCurrentPosition();
    
    this.newActions = [];
    
    console.log("Process New loan Event:", loanData);
    
    // Create context for centralized action generator
    const context: LoanActionContext = {
      currentPositionId: this.currentPositionId,
      loanCount: this.loanCount,
      isStaleLoan: false,
    };
    
    // Use centralized action generator for position-specific actions
    const loanActions = generatePositionSpecificActions(loanData, context);
    this.newActions.push(...loanActions as PriorityAction[]);

    // Add new actions to the beginning of the list (most recent first)
    this.priorityActions = [...this.newActions, ...this.priorityActions];

    // Keep the list manageable - max 10 actions
    if (this.priorityActions.length > 10) {
      this.priorityActions = this.priorityActions.slice(0, 10);
    }

    // Notify all subscribers about the update
    this.notifySubscribers();

    console.log('PriorityActionService: Processed new loan using centralized generator', {
      currentPositionId: this.currentPositionId,
      currentPositionName: getPositionNameByIdStatic(this.currentPositionId),
      newActionsGenerated: this.newActions.length,
    });

    return {
      priorityActions: this.priorityActions,
      newActionsAdded: this.newActions.length,
    };
  }

  /**
   * Get all current priority actions
   * @returns Array of priority actions
   */
  public getPriorityActions(): PriorityAction[] {
    return [...this.priorityActions];
  }

  /**
   * Clear all priority actions
   */
  public clearPriorityActions(): void {
    this.priorityActions = [];
    this.loanCount = 0;
  }

  /**
   * Reset to default priority actions
   */
  public resetToDefaults(): void {
    this.priorityActions = [];
    this.loanCount = 0;
    this.isInitialized = false;
  }

  /**
   * Get the total number of loans processed
   */
  public getLoanCount(): number {
    return this.loanCount;
  }

  /**
   * Check if service is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset initialization state (call when user context changes, e.g., impersonation)
   * This allows the service to re-fetch from API with new user context
   */
  public resetInitialization(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    this.priorityActions = [];
    this.loanCount = 0;
    console.log('PriorityActionService: Initialization state reset');
  }

  /**
   * Mark a priority action as completed (removes it from the list)
   * @param index - The index of the action to mark as completed
   */
  public markAsCompleted(index: number): void {
    if (index >= 0 && index < this.priorityActions.length) {
      const completed = this.priorityActions.splice(index, 1);
      console.log('PriorityActionService: Marked action as completed:', completed[0]?.action);

      // Notify all subscribers about the update
      this.notifySubscribers();
    }
  }

  /**
   * Generate a morning brief summary based on current state
   */
  public generateMorningBrief(): {
    greeting: string;
    date: string;
    priorityActions: PriorityAction[];
    teamSnapshot: {
      totalStaff: number;
      onLeave: number;
      pendingTasks: number;
      completedToday: number;
    };
  } {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    // Get user name from context
    let userName = 'User';
    if (this.userContext) {
      userName = `${this.userContext.firstName} ${this.userContext.lastName}`.trim() || 'User';
    } else {
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('thisUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.first_name && user.last_name) {
              userName = `${user.first_name} ${user.last_name}`;
            } else if (user.name) {
              userName = user.name;
            }
          }
        } catch (e) {
          console.error('Error getting user name:', e);
        }
      }
    }

    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      greeting: `${greeting}, ${userName}`,
      date: dateStr,
      priorityActions: this.priorityActions,
      teamSnapshot: {
        totalStaff: 24,
        onLeave: 2,
        pendingTasks: this.priorityActions.length,
        completedToday: 0,
      },
    };
  }
}

export default PriorityActionService;
