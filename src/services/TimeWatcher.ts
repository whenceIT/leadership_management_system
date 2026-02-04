/**
 * TimeWatcher Service
 * A real-time event service that monitors time and sends periodic notifications
 */

import * as toastr from 'toastr';

// Configure toastr globally using the proper API
toastr.options.closeButton = true;
toastr.options.debug = false;
toastr.options.newestOnTop = true;
toastr.options.progressBar = true;
toastr.options.positionClass = 'toast-top-right';
toastr.options.preventDuplicates = true;
toastr.options.onclick = undefined;
toastr.options.showDuration = 300;
toastr.options.hideDuration = 1000;
toastr.options.timeOut = 5000;
toastr.options.extendedTimeOut = 1000;
toastr.options.showEasing = 'swing';
toastr.options.hideEasing = 'linear';
toastr.options.showMethod = 'fadeIn';
toastr.options.hideMethod = 'fadeOut';
toastr.options.tapToDismiss = true;

export interface TimeWatcherConfig {
  interval?: number; // Interval in milliseconds (default: 5000ms)
  enabled?: boolean; // Whether the watcher is enabled (default: true)
  message?: string; // Custom message (default: "follow up on your clients")
  title?: string; // Custom title (default: "Time Alert")
}

export interface TimeWatcherEvent {
  timestamp: Date;
  message: string;
  title: string;
}

export type TimeWatcherEventListener = (event: TimeWatcherEvent) => void;

class TimeWatcher {
  private intervalId: NodeJS.Timeout | null = null;
  private config: Required<TimeWatcherConfig>;
  private listeners: Set<TimeWatcherEventListener> = new Set();
  private isRunning: boolean = false;

  constructor(config: TimeWatcherConfig = {}) {
    this.config = {
      interval: config.interval || 900000,
      enabled: config.enabled !== undefined ? config.enabled : true,
      message: config.message || 'follow up on your clients',
      title: config.title || 'Time Alert',
    };
  }

  /**
   * Start the time watcher
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('TimeWatcher is already running');
      return;
    }

    if (!this.config.enabled) {
      console.warn('TimeWatcher is disabled');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.triggerEvent();
    }, this.config.interval);

    console.log(`TimeWatcher started with ${this.config.interval}ms interval`);
  }

  /**
   * Stop the time watcher
   */
  public stop(): void {
    if (!this.isRunning) {
      console.warn('TimeWatcher is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('TimeWatcher stopped');
  }

  /**
   * Check if the watcher is currently running
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Update the configuration
   */
  public updateConfig(config: Partial<TimeWatcherConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If interval changed and watcher is running, restart it
    if (config.interval && this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Required<TimeWatcherConfig> {
    return { ...this.config };
  }

  /**
   * Add an event listener
   */
  public addListener(listener: TimeWatcherEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove an event listener
   */
  public removeListener(listener: TimeWatcherEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Clear all event listeners
   */
  public clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Trigger a time event
   */
  private triggerEvent(): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const event: TimeWatcherEvent = {
      timestamp: now,
      message: this.config.message,
      title: this.config.title,
    };

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in TimeWatcher listener:', error);
      }
    });

    // Show toast notification with bounceIn animation
    this.showNotification(event);
  }

  /**
   * Show a toast notification with bounceIn animation
   */
  private showNotification(event: TimeWatcherEvent): void {
    const timeString = event.timestamp.toLocaleTimeString();
    const fullMessage = `${timeString} - ${event.message}`;

    // Show the toast (bounceIn animation is applied via CSS)
    toastr.info(fullMessage, event.title);
  }

  /**
   * Manually trigger a notification
   */
  public triggerNow(): void {
    this.triggerEvent();
  }

  /**
   * Get the next scheduled trigger time
   */
  public getNextTriggerTime(): Date | null {
    if (!this.isRunning || !this.intervalId) {
      return null;
    }
    
    const now = new Date();
    return new Date(now.getTime() + this.config.interval);
  }

  /**
   * Get time until next trigger in milliseconds
   */
  public getTimeUntilNextTrigger(): number | null {
    if (!this.isRunning) {
      return null;
    }
    
    return this.config.interval;
  }
}

// Export singleton instance
export const timeWatcher = new TimeWatcher();

// Export class for custom instances
export default TimeWatcher;
