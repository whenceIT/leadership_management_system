export interface ScheduledReview {
  id: string;
  position: string;
  reviewType: string;
  title: string;
  description?: string;
  scheduledDateTime: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  sendReminder: boolean;
  reminderDaysBefore: number;
  kpiId?: string;
  kpiName?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdByEmail?: string;
  userId?: number;
  officeId?: number;
  createdAt: string;
  updatedAt: string;
}

// Initialize or get the global store
export function getReviewsStore(): Map<string, ScheduledReview> {
  // Use type assertion to avoid duplicate declaration issues
  const globalAny = globalThis as any;
  if (!globalAny.scheduledReviewsStore) {
    globalAny.scheduledReviewsStore = new Map<string, ScheduledReview>();
  }
  return globalAny.scheduledReviewsStore as Map<string, ScheduledReview>;
}
