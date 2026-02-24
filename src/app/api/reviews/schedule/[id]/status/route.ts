import { NextRequest, NextResponse } from 'next/server';
import { resolveSession } from '@/lib/auth';
import { ScheduledReview, getReviewsStore } from '../../types';

// Valid status values
const VALID_STATUSES = ['scheduled', 'in-progress', 'completed', 'cancelled'] as const;
type ReviewStatus = typeof VALID_STATUSES[number];

// PATCH - Update only the status of a scheduled review
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await resolveSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to update review status.' },
        { status: 401 }
      );
    }

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
    const { status } = body;

    // Validate status
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required.' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status as ReviewStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const previousStatus = existingReview.status;

    // Update the review status
    const updatedReview: ScheduledReview = {
      ...existingReview,
      status: status as ReviewStatus,
      updatedAt: new Date().toISOString(),
    };

    scheduledReviewsStore.set(id, updatedReview);

    console.log(`[Reviews Schedule API] Review status updated:`, {
      id: updatedReview.id,
      previousStatus,
      newStatus: updatedReview.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Review status updated successfully',
      data: {
        id: updatedReview.id,
        previousStatus,
        newStatus: updatedReview.status,
      },
    });
  } catch (error) {
    console.error('[Reviews Schedule API] Error updating review status:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while updating the review status.' },
      { status: 500 }
    );
  }
}
