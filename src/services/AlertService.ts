'use client';

import { getUserContext, UserContext } from '@/utils/userContext';
import { getPositionNameByIdStatic } from '@/hooks/useUserPosition';
import { IMPERSONATION_STARTED_EVENT, IMPERSONATION_ENDED_EVENT } from '@/hooks/useUserPosition';

/**
 * Alert types supported by the system
 */
export type AlertType = 'warning' | 'info' | 'success' | 'error';

/**
 * Alert priority levels
 */
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert interface
 */
export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  title?: string;
  category?: string;
  source?: string;
  kpi_id?: number;
  positionId?: number;
  officeId?: number;
  provinceId?: number;
  userId?: number;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

/**
 * Alert filter options
 */
export interface AlertFilter {
  types?: AlertType[];
  priorities?: AlertPriority[];
  positionId?: number;
  officeId?: number;
  unreadOnly?: boolean;
  category?: string;
  kpi_id?: number;
}

/**
 * Callback type for alert updates
 */
export type AlertCallback = (alerts: Alert[]) => void;

/**
 * AlertService manages centralized notification alerts for the Leadership Assistant.
 * 
 * FEATURES:
 * - Singleton pattern for centralized alert management
 * - Position-specific alerts based on user's current position
 * - Support for impersonation - shows alerts for impersonated position
 * - Real-time updates via subscriber pattern
 * - Alert persistence and state management
 * 
 * DATA SOURCE:
 * - API: GET /smart-alerts (future implementation)
 * - Real-time updates via WebSocket events
 * - System-generated alerts based on business rules
 */
export class AlertService {
  private static instance: AlertService;
  private alerts: Alert[] = [];
  private subscribers: Set<AlertCallback> = new Set();
  private userContext: UserContext | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.refreshUserContext();
    // Alerts will be loaded from API via initializeFromAPI()
  }

  /**
   * Refresh user context from userContext utility
   */
  private refreshUserContext(): void {
    this.userContext = getUserContext();
  }

  /**
   * Get singleton instance of AlertService
   */
  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Subscribe to alert updates
   * @param callback - Function to call when alerts are updated
   * @returns Unsubscribe function
   */
  public subscribe(callback: AlertCallback): () => void {
    this.subscribers.add(callback);
    console.log('AlertService: Subscriber added. Total:', this.subscribers.size);
    
    // Immediately call with current alerts
    callback([...this.alerts]);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      console.log('AlertService: Subscriber removed. Total:', this.subscribers.size);
    };
  }

  /**
   * Notify all subscribers about alert updates
   */
  private notifySubscribers(): void {
    const currentAlerts = [...this.alerts];
    this.subscribers.forEach(callback => {
      try {
        callback(currentAlerts);
      } catch (error) {
        console.error('AlertService: Error notifying subscriber:', error);
      }
    });
    console.log('AlertService: Notified', this.subscribers.size, 'subscribers');
  }

  /**
   * Get all alerts, optionally filtered
   * @param filter - Filter options
   * @returns Array of alerts
   */
  public getAlerts(filter?: AlertFilter): Alert[] {
    let filtered = [...this.alerts];

    if (filter) {
      if (filter.types && filter.types.length > 0) {
        filtered = filtered.filter(a => filter.types!.includes(a.type));
      }
      if (filter.priorities && filter.priorities.length > 0) {
        filtered = filtered.filter(a => filter.priorities!.includes(a.priority));
      }
      if (filter.positionId) {
        filtered = filtered.filter(a => a.positionId === filter.positionId);
      }
      if (filter.officeId) {
        filtered = filtered.filter(a => a.officeId === filter.officeId);
      }
      if (filter.unreadOnly) {
        filtered = filtered.filter(a => !a.isRead);
      }
      if (filter.category) {
        filtered = filtered.filter(a => a.category === filter.category);
      }
      if (filter.kpi_id) {
        filtered = filtered.filter(a => a.kpi_id === filter.kpi_id);
      }
    }

    // Sort by priority (critical > high > medium > low) then by date
    const priorityOrder: Record<AlertPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return filtered.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Get unread alert count
   * @returns Number of unread alerts
   */
  public getUnreadCount(): number {
    return this.alerts.filter(a => !a.isRead && !a.isDismissed).length;
  }

  /**
   * Get alerts by type
   * @param type - Alert type
   * @returns Array of alerts of the specified type
   */
  public getAlertsByType(type: AlertType): Alert[] {
    return this.alerts.filter(a => a.type === type && !a.isDismissed);
  }

  /**
   * Get alerts by category
   * @param category - Alert category
   * @returns Array of alerts in the specified category
   */
  public getAlertsByCategory(category: string): Alert[] {
    return this.alerts.filter(a => a.category === category && !a.isDismissed);
  }

  /**
   * Add a new alert
   * @param alert - Alert to add (without id, createdAt, isRead, isDismissed)
   * @returns The created alert with generated id
   */
  public addAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'isRead' | 'isDismissed'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      isRead: false,
      isDismissed: false,
    };

    this.alerts.unshift(newAlert);
    this.notifySubscribers();
    
    console.log('AlertService: Added new alert:', newAlert.id, newAlert.type, newAlert.message);
    return newAlert;
  }

  /**
   * Add multiple alerts at once
   * @param alerts - Array of alerts to add
   */
  public addAlerts(alerts: Array<Omit<Alert, 'id' | 'createdAt' | 'isRead' | 'isDismissed'>>): void {
    const newAlerts: Alert[] = alerts.map(alert => ({
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      isRead: false,
      isDismissed: false,
    }));

    this.alerts = [...newAlerts, ...this.alerts];
    this.notifySubscribers();
    
    console.log('AlertService: Added', newAlerts.length, 'alerts');
  }

  /**
   * Mark an alert as read
   * @param alertId - ID of the alert to mark as read
   */
  public markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.notifySubscribers();
      console.log('AlertService: Marked alert as read:', alertId);
    }
  }

  /**
   * Mark all alerts as read
   */
  public markAllAsRead(): void {
    this.alerts.forEach(a => a.isRead = true);
    this.notifySubscribers();
    console.log('AlertService: Marked all alerts as read');
  }

  /**
   * Dismiss an alert
   * @param alertId - ID of the alert to dismiss
   */
  public dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isDismissed = true;
      this.notifySubscribers();
      console.log('AlertService: Dismissed alert:', alertId);
    }
  }

  /**
   * Remove an alert completely
   * @param alertId - ID of the alert to remove
   */
  public removeAlert(alertId: string): void {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      this.notifySubscribers();
      console.log('AlertService: Removed alert:', alertId);
    }
  }

  /**
   * Clear all alerts
   */
  public clearAllAlerts(): void {
    this.alerts = [];
    this.notifySubscribers();
    console.log('AlertService: Cleared all alerts');
  }

  /**
   * Clear dismissed alerts
   */
  public clearDismissedAlerts(): void {
    this.alerts = this.alerts.filter(a => !a.isDismissed);
    this.notifySubscribers();
    console.log('AlertService: Cleared dismissed alerts');
  }

  /**
   * Generate position-specific alerts based on business rules
   * @param positionId - Position ID to generate alerts for
   * @param context - Additional context for alert generation
   */
  public generatePositionSpecificAlerts(positionId: number, context?: {
    officeId?: number;
    provinceId?: number;
    loanCount?: number;
    staleLoanCount?: number;
  }): void {
    const positionName = getPositionNameByIdStatic(positionId);
    const generatedAlerts: Array<Omit<Alert, 'id' | 'createdAt' | 'isRead' | 'isDismissed'>> = [];

    // Generate alerts based on position and context
    if (context?.staleLoanCount && context.staleLoanCount > 5) {
      generatedAlerts.push({
        type: 'warning',
        priority: 'high',
        message: `${context.staleLoanCount} loans have been pending for more than 3 days`,
        title: 'Stale Loans Alert',
        category: 'loans',
        source: 'system',
        positionId,
        officeId: context.officeId,
      });
    }

    // Branch Manager specific alerts
    if (positionId === 5) {
      generatedAlerts.push({
        type: 'info',
        priority: 'medium',
        message: 'Daily branch performance report is ready for review',
        title: 'Daily Report',
        category: 'reports',
        source: 'system',
        positionId,
      });
    }

    // District Manager specific alerts
    if (positionId === 4) {
      generatedAlerts.push({
        type: 'info',
        priority: 'medium',
        message: 'Weekly district summary available for your review',
        title: 'Weekly Summary',
        category: 'reports',
        source: 'system',
        positionId,
      });
    }

    // GOM specific alerts
    if (positionId === 1) {
      generatedAlerts.push({
        type: 'warning',
        priority: 'medium',
        message: 'Monthly performance review cycle starts in 3 days',
        title: 'Upcoming Review',
        category: 'hr',
        source: 'system',
        positionId,
      });
    }

    if (generatedAlerts.length > 0) {
      this.addAlerts(generatedAlerts);
    }
  }

  /**
   * Reset service state (call when impersonation changes)
   * Re-fetches alerts from API with new user context
   */
  public async reset(): Promise<void> {
    this.refreshUserContext();
    this.alerts = []; // Clear existing alerts
    this.isInitialized = false;
    await this.initializeFromAPI();
    this.notifySubscribers();
    console.log('AlertService: Reset with new user context');
  }

  /**
   * Initialize alerts from API (future implementation)
   */
  public async initializeFromAPI(): Promise<void> {
    try {
      this.refreshUserContext();
      
      if (!this.userContext) {
        console.error('AlertService: No user context available');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (this.userContext.userId) {
        params.append('user_id', String(this.userContext.userId));
      }
      if (this.userContext.officeId) {
        params.append('office_id', String(this.userContext.officeId));
      }
      if (this.userContext.positionId) {
        params.append('position_id', String(this.userContext.positionId));
      }

      // Fetch alerts from API
      const response = await fetch(
        `${API_BASE_URL}/smart-alerts?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const apiAlerts = data.data || data;
        
        if (Array.isArray(apiAlerts)) {
          // Merge API alerts with default alerts
          const formattedAlerts: Alert[] = apiAlerts.map((item: any) => ({
            id: item.id || `alert-api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: item.type || 'info',
            priority: item.priority || 'medium',
            message: item.message || item.actions || '',
            title: item.title || item.category,
            category: item.category,
            source: 'api',
            kpi_id: item.kpi_id,
            positionId: item.position_id,
            officeId: item.office_id,
            userId: item.user_id,
            isRead: item.is_read || false,
            isDismissed: false,
            createdAt: new Date(item.created_date || item.created_at || new Date()),
            metadata: item,
          }));

          this.alerts = [...formattedAlerts, ...this.alerts.filter(a => a.source !== 'api')];
          this.notifySubscribers();
          
          console.log('AlertService: Loaded', formattedAlerts.length, 'alerts from API');
        }
      } else {
        console.log('AlertService: API not available, using default alerts');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('AlertService: Error initializing from API:', error);
      this.isInitialized = true;
    }
  }
}

export default AlertService;
