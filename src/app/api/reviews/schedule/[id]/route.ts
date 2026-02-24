import { NextRequest, NextResponse } from 'next/server';
import { ScheduledReview, getReviewsStore } from '../types';

// GET - Retrieve a single scheduled review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduledReviewsStore = getReviewsStore();
    const review = scheduledReviewsStore.get(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Scheduled review not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
        userId: review.userId,
        officeId: review.officeId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Reviews Schedule API] Error fetching scheduled review:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while fetching the scheduled review.' },
      { status: 500 }
    );
  }
}

// PUT - Update a scheduled review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduledReviewsStore = getReviewsStore();
    const existingReview = scheduledReviewsStore.get(id);

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Scheduled review not found.' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      scheduledDate,
      scheduledTime,
      assignee,
      priority,
      status,
      sendReminder,
      reminderDaysBefore,
      kpiId,
    } = body;

    // Build the scheduledDateTime if date/time provided
    let scheduledDateTime = existingReview.scheduledDateTime;
    if (scheduledDate) {
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}`).toISOString();
      
      // Validate scheduled date is in the future
      const scheduledDateObj = new Date(scheduledDateTime);
      const now = new Date();
      if (scheduledDateObj <= now) {
        return NextResponse.json(
          { success: false, error: 'Scheduled date and time must be in the future.' },
          { status: 400 }
        );
      }
    }

    // Validate title length if provided
    if (title !== undefined && title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Review title must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    // Validate reminder days if provided
    if (sendReminder !== undefined && reminderDaysBefore !== undefined) {
      if (reminderDaysBefore < 1 || reminderDaysBefore > 30) {
        return NextResponse.json(
          { success: false, error: 'Reminder days must be between 1 and 30.' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update the review
    const updatedReview: ScheduledReview = {
      ...existingReview,
      title: title !== undefined ? title.trim() : existingReview.title,
      description: description !== undefined ? description?.trim() : existingReview.description,
      scheduledDateTime,
      assignee: assignee !== undefined ? assignee : existingReview.assignee,
      priority: priority !== undefined ? priority : existingReview.priority,
      status: status !== undefined ? status : existingReview.status,
      sendReminder: sendReminder !== undefined ? sendReminder : existingReview.sendReminder,
      reminderDaysBefore: reminderDaysBefore !== undefined ? reminderDaysBefore : existingReview.reminderDaysBefore,
      kpiId: kpiId !== undefined ? kpiId : existingReview.kpiId,
      updatedAt: new Date().toISOString(),
    };

    scheduledReviewsStore.set(id, updatedReview);

    console.log(`[Reviews Schedule API] Review updated:`, {
      id: updatedReview.id,
      title: updatedReview.title,
      status: updatedReview.status,
    });

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
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduledReviewsStore = getReviewsStore();
    const existingReview = scheduledReviewsStore.get(id);

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Scheduled review not found.' },
        { status: 404 }
      );
    }

    scheduledReviewsStore.delete(id);

    console.log(`[Reviews Schedule API] Review cancelled:`, {
      id,
      title: existingReview.title,
    });

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
