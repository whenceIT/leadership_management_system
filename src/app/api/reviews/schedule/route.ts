import { NextRequest, NextResponse } from 'next/server';
import { ScheduledReview, getReviewsStore } from './types';

// Interface for scheduled review request
interface ScheduleReviewRequest {
  position: string;
  reviewType: string;
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  sendReminder: boolean;
  reminderDaysBefore: number;
  kpiId?: string;
  // User info from frontend (localStorage via useUserPosition hook)
  userId?: number;
  userEmail?: string;
  userName?: string;
  officeId?: number;
}

// Generate a unique ID
function generateId(): string {
  return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST - Schedule a new review
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ScheduleReviewRequest = await request.json();
    const {
      position,
      reviewType,
      title,
      description,
      scheduledDate,
      scheduledTime,
      assignee,
      priority,
      sendReminder,
      reminderDaysBefore,
      kpiId,
      userId,
      userEmail,
      userName,
      officeId,
    } = body;

    // Validate required fields
    if (!position || !reviewType || !title || !scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: position, reviewType, title, and scheduledDate are required.' },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Review title must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    // Validate scheduled date is in the future
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}`);
    const now = new Date();
    if (scheduledDateTime <= now) {
      return NextResponse.json(
        { success: false, error: 'Scheduled date and time must be in the future.' },
        { status: 400 }
      );
    }

    // Validate reminder days
    if (sendReminder && (reminderDaysBefore < 1 || reminderDaysBefore > 30)) {
      return NextResponse.json(
        { success: false, error: 'Reminder days must be between 1 and 30.' },
        { status: 400 }
      );
    }

    // Create scheduled review
    const reviewId = generateId();
    const scheduledReview: ScheduledReview = {
      id: reviewId,
      position,
      reviewType,
      title: title.trim(),
      description: description?.trim(),
      scheduledDateTime: scheduledDateTime.toISOString(),
      assignee: assignee || position,
      priority: priority || 'medium',
      sendReminder: sendReminder ?? true,
      reminderDaysBefore: reminderDaysBefore || 1,
      kpiId: kpiId || undefined,
      status: 'scheduled',
      createdBy: userName || userEmail || String(userId) || 'unknown',
      createdByEmail: userEmail,
      userId: userId,
      officeId: officeId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Store the scheduled review
    const scheduledReviewsStore = getReviewsStore();
    scheduledReviewsStore.set(reviewId, scheduledReview);

    // In production, you would:
    // 1. Save to database
    // 2. Create calendar event if integrated
    // 3. Schedule reminder notifications
    // 4. Send confirmation email to assignee

    console.log(`[Reviews Schedule API] Review scheduled:`, {
      id: reviewId,
      title: scheduledReview.title,
      scheduledFor: scheduledReview.scheduledDateTime,
      assignee: scheduledReview.assignee,
      createdBy: scheduledReview.createdBy,
    });

    return NextResponse.json({
      success: true,
      message: 'Review scheduled successfully',
      data: {
        id: scheduledReview.id,
        title: scheduledReview.title,
        reviewType: scheduledReview.reviewType,
        scheduledDateTime: scheduledReview.scheduledDateTime,
        assignee: scheduledReview.assignee,
        priority: scheduledReview.priority,
        status: scheduledReview.status,
        sendReminder: scheduledReview.sendReminder,
        reminderDaysBefore: scheduledReview.reminderDaysBefore,
        kpiId: scheduledReview.kpiId,
      },
    });
  } catch (error) {
    console.error('[Reviews Schedule API] Error scheduling review:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while scheduling the review.' },
      { status: 500 }
    );
  }
}

// GET - Retrieve scheduled reviews
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');
    const userId = searchParams.get('user_id');
    const officeId = searchParams.get('office_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limitParam = searchParams.get('limit');

    // Filter reviews
    const scheduledReviewsStore = getReviewsStore();
    let reviews = Array.from(scheduledReviewsStore.values());

    // Filter by position if provided
    if (position) {
      reviews = reviews.filter(r => r.position === position);
    }

    // Filter by status if provided
    if (status) {
      reviews = reviews.filter(r => r.status === status);
    }

    // Filter for upcoming reviews if requested
    if (upcoming === 'true') {
      const now = new Date();
      reviews = reviews.filter(r => new Date(r.scheduledDateTime) > now && r.status === 'scheduled');
    }

    // Filter by user_id if provided
    if (userId) {
      reviews = reviews.filter(r => String(r.userId) === userId || r.createdBy === userId);
    }

    // Filter by office_id if provided
    if (officeId) {
      reviews = reviews.filter(r => String(r.officeId) === officeId);
    }

    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate);
      reviews = reviews.filter(r => new Date(r.scheduledDateTime) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the end date fully
      reviews = reviews.filter(r => new Date(r.scheduledDateTime) <= end);
    }

    // Sort by scheduled date (earliest first)
    reviews.sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime());

    // Apply limit if provided
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    reviews = reviews.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews.map(review => ({
        id: review.id,
        position: review.position,
        reviewType: review.reviewType,
        title: review.title,
        description: review.description,
        scheduledDateTime: review.scheduledDateTime,
        assignee: review.assignee,
        priority: review.priority,
        status: review.status,
        sendReminder: review.sendReminder,
        reminderDaysBefore: review.reminderDaysBefore,
        kpiId: review.kpiId,
        kpiName: review.kpiName,
        createdBy: review.createdBy,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
    });
  } catch (error) {
    console.error('[Reviews Schedule API] Error fetching scheduled reviews:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while fetching scheduled reviews.' },
      { status: 500 }
    );
  }
}

// PUT - Update a scheduled review
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required.' },
        { status: 400 }
      );
    }

    // Find the review
    const scheduledReviewsStore = getReviewsStore();
    const existingReview = scheduledReviewsStore.get(id);
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Scheduled review not found.' },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview: ScheduledReview = {
      ...existingReview,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    scheduledReviewsStore.set(id, updatedReview);

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        id: updatedReview.id,
        title: updatedReview.title,
        status: updatedReview.status,
        scheduledDateTime: updatedReview.scheduledDateTime,
      },
    });
  } catch (error) {
    console.error('[Reviews Schedule API] Error updating scheduled review:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while updating the scheduled review.' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete a scheduled review
export async function DELETE(request: NextRequest) {
  try {
    // Get review ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required.' },
        { status: 400 }
      );
    }

    // Find and delete the review
    const scheduledReviewsStore = getReviewsStore();
    const existingReview = scheduledReviewsStore.get(id);
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Scheduled review not found.' },
        { status: 404 }
      );
    }

    scheduledReviewsStore.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Scheduled review cancelled successfully',
    });
  } catch (error) {
    console.error('[Reviews Schedule API] Error deleting scheduled review:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while cancelling the scheduled review.' },
      { status: 500 }
    );
  }
}
