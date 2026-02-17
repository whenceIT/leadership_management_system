'use client';

import { LoanData } from '@/hooks/useLoanUpdates';
import { getOfficeNameById } from '@/hooks/useOffice';

export interface PriorityAction {
  action: string;
  due: string;
  urgent: boolean;
}

export interface PriorityActionResult {
  priorityActions: PriorityAction[];
  newActionsAdded: number;
}

// Callback type for priority action updates
export type PriorityActionCallback = (actions: PriorityAction[]) => void;

// LocalStorage keys
const STORAGE_KEY = 'priority_actions';
const LOAN_EVENTS_KEY = 'loan_events';
const LOAN_COUNT_KEY = 'loan_count';

/**
 * PriorityActionService generates priority actions based on loan data
 * and current system state. This service is called when new loans are created
 * to populate the priority actions array in the Leadership Assistant.
 * All data is synced to localStorage for persistence and cross-component access.
 */
export class PriorityActionService {
  private static instance: PriorityActionService;
  private priorityActions: PriorityAction[] = [];
  private newActions: PriorityAction[] = []; // Global array for both processNewLoan and checkStaleLoans
  private loanCount: number = 0;
  private subscribers: Set<PriorityActionCallback> = new Set();
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize with data from localStorage
    this.initializeFromStorage();
  }

  /**
   * Initialize from localStorage for data consistency
   */
  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Load priority actions from localStorage
      const storedActions = localStorage.getItem(STORAGE_KEY);
      if (storedActions) {
        this.priorityActions = JSON.parse(storedActions);
        console.log('📋 PriorityActionService: Loaded', this.priorityActions.length, 'actions from localStorage');
      }

      // Load loan count from localStorage
      const storedCount = localStorage.getItem(LOAN_COUNT_KEY);
      if (storedCount) {
        this.loanCount = parseInt(storedCount, 10);
        console.log('📋 PriorityActionService: Loaded loan count:', this.loanCount);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('📋 PriorityActionService: Error loading from localStorage:', error);
    }
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.priorityActions));
      localStorage.setItem(LOAN_COUNT_KEY, this.loanCount.toString());
      console.log('📋 PriorityActionService: Saved to localStorage');
    } catch (error) {
      console.error('📋 PriorityActionService: Error saving to localStorage:', error);
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
    console.log('📋 PriorityActionService: Subscriber added. Total:', this.subscribers.size);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      console.log('📋 PriorityActionService: Subscriber removed. Total:', this.subscribers.size);
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
        console.error('📋 PriorityActionService: Error notifying subscriber:', error);
      }
    });
    console.log('📋 PriorityActionService: Notified', this.subscribers.size, 'subscribers');
  }

  /**
   * Initialize with default priority actions
   */
  private initializeDefaultActions(): void {
    this.priorityActions = [];
  }

  /**
   * Fetch loans pending for more than specified days from API
   * @param days - Number of days to consider a loan as stale (default: 3)
   * @returns Array of stale loan data
   */
  private async fetchStaleLoans(days: number = 3): Promise<LoanData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      const response = await fetch(`${API_BASE_URL}/smart-loans?status=pending&days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('📋 PriorityActionService: Failed to fetch stale loans:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('📋 PriorityActionService: Fetched stale loans:', data.length || 0);
      return data;
    } catch (error) {
      console.error('📋 PriorityActionService: Error fetching stale loans:', error);
      return [];
    }
  }

  /**
   * Add priority actions for loans that have been pending for more than 3 days
   * This function is called to proactively identify stale loans
   */
  public async checkStaleLoans(): Promise<number> {
    const staleLoans = await this.fetchStaleLoans(3);
    
    if (staleLoans.length === 0) {
      return 0;
    }

    // Group loans by days pending
    const staleByDays: { [days: number]: { count: number; totalAmount: number } } = {};
    
    for (const loan of staleLoans) {
      // Calculate days pending
      const createdAt = loan.created_at ? new Date(loan.created_at) : new Date();
      const now = new Date();
      const daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Handle amount
      let amount = 0;
      if (typeof loan.amount === 'string') {
        amount = parseFloat(loan.amount) || 0;
      } else if (typeof loan.amount === 'number') {
        amount = loan.amount;
      }

      if (!staleByDays[daysPending]) {
        staleByDays[daysPending] = { count: 0, totalAmount: 0 };
      }
      staleByDays[daysPending].count++;
      staleByDays[daysPending].totalAmount += amount;
    }

    // Check for existing stale loan action to avoid duplicates
    const existingStaleAction = this.priorityActions.find(
      (action) => action.action.includes('loans have been pending')
    );
    
    // Remove existing stale action if found
    if (existingStaleAction) {
      const index = this.priorityActions.indexOf(existingStaleAction);
      if (index > -1) {
        this.priorityActions.splice(index, 1);
      }
    }

    // Generate combined action message based on groups
    const daysGroups = Object.keys(staleByDays).map(Number).sort((a, b) => b - a);
    
    if (daysGroups.length === 1) {
      const days = daysGroups[0];
      const { count, totalAmount } = staleByDays[days];
      const urgent = days >= 7;
      
      this.newActions.push({
        action: `⏰ ${count} loan${count > 1 ? 's' : ''} have been pending for more than ${days} day${days > 1 ? 's' : ''}`,
        due: `Total amount: ${totalAmount.toLocaleString()} • Review required`,
        urgent,
      });
    } else {
      // Multiple groups - show summary
      const totalStale = staleLoans.length;
      const maxDays = Math.max(...daysGroups);
      const totalAmount = Object.values(staleByDays).reduce((sum, g) => sum + g.totalAmount, 0);
      
      this.newActions.push({
        action: `⏰ ${totalStale} loans have been pending for more than 3 days`,
        due: `Longest: ${maxDays} days • Total amount: ${totalAmount.toLocaleString()} • Urgent review required`,
        urgent: true,
      });
    }

    // Add new actions to priority actions
    const newActionsCount = this.newActions.length;
    this.priorityActions = [...this.newActions, ...this.priorityActions];
    
    // Clear the global newActions array after processing
    this.newActions = [];

    // Keep the list manageable - max 10 actions
    if (this.priorityActions.length > 10) {
      this.priorityActions = this.priorityActions.slice(0, 10);
    }

    // Save to localStorage
    this.saveToStorage();

    // Notify subscribers
    if (newActionsCount > 0) {
      this.notifySubscribers();
    }

    console.log('📋 PriorityActionService: Added', newActionsCount, 'stale loan actions');
    return newActionsCount;
  }

  /**
   * Process a new loan and generate relevant priority actions
   * Analyzes loan data and provides helpful, human-readable assistant messages
   * @param loanData - The newly created loan data
   * @returns The result containing generated priority actions
   */
  public processNewLoan(loanData: LoanData): PriorityActionResult {
    this.loanCount++;
    // Use the global newActions array instead of declaring locally
    this.newActions = [];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    console.log("Incoming:*****", loanData, "*******");
    // Handle amount as either number or string
    let amount = 0;
    if (typeof loanData.amount === 'string') {
      amount = parseFloat(loanData.amount) || 0;
    } else if (typeof loanData.amount === 'number') {
      amount = loanData.amount;
    }
    
    // Get borrower name - check multiple possible field names
    const clientField = loanData.client as string | undefined;
    const borrowerNameField = loanData.borrower_name as string | undefined;
    const borrowerName = clientField || borrowerNameField || 'Unknown Client';
    
    const loanNumberField = loanData.loan_number as string | undefined;
    const loanNumber = loanNumberField || `LOAN-${loanData.id}`;
    
    const statusField = loanData.status as string | undefined;
    const status = (statusField || 'pending').toLowerCase();
    
    const createdByField = loanData.created_by as string | undefined;
    const createdBy = createdByField || 'Unknown';
    
    const officeId = (loanData.office_id as number) || 0;
    
    const loanTypeField = loanData.type as string | undefined;
    const loanType = loanTypeField || 'New Loan';

    // Generate human-readable, assistant-style messages
    
    // Main notification about new loan
    console.log(borrowerName)
    this.newActions.push({
      action: `💰 ${loanType} received from ${borrowerName}`,
      due: `Amount: ${amount.toLocaleString()} • Submitted by ${createdBy} • ${timeStr}`,
      urgent: amount >= 50000,
    });

    // High-value loan - requires immediate attention (>= 50000)
    if (amount >= 50000) {
      const recommendation = amount >= 100000 
        ? "This is a significant amount. Consider escalating to senior management."
        : "Review collateral requirements and verify borrower credit history.";
      this.newActions.push({
        action: `🚨 High-value loan requires your attention`,
        due: `${amount.toLocaleString()} • ${recommendation}`,
        urgent: true,
      });
    }

    // Large loan amount - needs supervisory approval (>= 100000)
    if (amount >= 100000) {
      this.newActions.push({
        action: `⚠️ Large loan - Senior Management Approval Required`,
        due: "This loan exceeds the approval threshold. Please prepare escalation memo.",
        urgent: true,
      });
    }

    // Pending status loans - need follow-up
    if (status === 'pending' || status === 'under_review') {
      this.newActions.push({
        action: `📋 Loan awaiting review - Follow up needed`,
        due: `${borrowerName}'s application is ${status.replace('_', ' ')}. Schedule review meeting.`,
        urgent: false,
      });
    }

    // Office-specific reminder - get actual office name
    if (officeId > 0) {
      // Get office name from standalone function
      const officeName = getOfficeNameById(officeId) || `Office #${officeId}`;
      
      this.newActions.push({
        action: `🏢 New application from ${officeName}`,
        due: `Track ${loanType.toLowerCase()} submissions for this branch today.`,
        urgent: false,
      });
    }

    // First loan of the day
    if (this.loanCount === 1) {
      this.newActions.push({
        action: `🌅 Good start! First loan of the day received`,
        due: "Review all pending applications to maintain turnaround time targets.",
        urgent: false,
      });
    }

    // Add new actions to the beginning of the list (most recent first)
    this.priorityActions = [...this.newActions, ...this.priorityActions];

    // Keep the list manageable - max 10 actions
    if (this.priorityActions.length > 10) {
      this.priorityActions = this.priorityActions.slice(0, 10);
    }

    // Save to localStorage for persistence
    this.saveToStorage();

    // Notify all subscribers about the update
    this.notifySubscribers();

    console.log('📋 PriorityActionService: Processed new loan', {
      loanNumber,
      borrowerName,
      amount,
      loanType,
      createdBy,
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
    this.clearStorage();
  }

  /**
   * Clear localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOAN_COUNT_KEY);
      console.log('📋 PriorityActionService: Cleared localStorage');
    } catch (error) {
      console.error('📋 PriorityActionService: Error clearing localStorage:', error);
    }
  }

  /**
   * Reset to default priority actions
   */
  public resetToDefaults(): void {
    this.priorityActions = [];
    this.loanCount = 0;
    this.clearStorage();
  }

  /**
   * Get the total number of loans processed
   */
  public getLoanCount(): number {
    return this.loanCount;
  }

  /**
   * Mark a priority action as completed (removes it from the list)
   * @param index - The index of the action to mark as completed
   */
  public markAsCompleted(index: number): void {
    if (index >= 0 && index < this.priorityActions.length) {
      const completed = this.priorityActions.splice(index, 1);
      console.log('✅ PriorityActionService: Marked action as completed:', completed[0]?.action);
      
      // Save to localStorage
      this.saveToStorage();

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

    // Try to get user name from localStorage
    let userName = 'User';
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
