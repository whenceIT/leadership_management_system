import { NextRequest, NextResponse } from 'next/server';

// Interface for sign-off request
interface SignOffRequest {
  position: string;
  signature: string;
  reviewType: string;
  reviewId?: string;
  comments?: string;
  // User info from frontend (localStorage via useUserPosition hook)
  userId?: number;
  userEmail?: string;
  userName?: string;
  officeId?: number;
}

// Interface for sign-off record
interface SignOffRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  officeId?: number;
  position: string;
  signature: string;
  reviewType: string;
  reviewId?: string;
  comments?: string;
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Global in-memory store for development (replace with database in production)
// This would typically be stored in a database table like 'review_signoffs'
declare global {
  // eslint-disable-next-line no-var
  var signOffStore: SignOffRecord[] | undefined;
}

// Initialize or get the global store
function getSignOffStore(): SignOffRecord[] {
  if (!globalThis.signOffStore) {
    globalThis.signOffStore = [];
  }
  return globalThis.signOffStore;
}

/**
 * POST /api/reviews/signoff
 * Submit a digital sign-off for a review
 * 
 * Request Body:
 * - position: string (required) - User's position/role
 * - signature: string (required) - Electronic signature (user's name)
 * - reviewType: string (required) - Type of review being signed
 * - reviewId: string (optional) - Specific review ID if signing a particular review
 * - comments: string (optional) - Additional comments with the signature
 * - userId: number (optional) - User ID from localStorage
 * - userEmail: string (optional) - User email from localStorage
 * - userName: string (optional) - User full name from localStorage
 * - officeId: number (optional) - Office ID from localStorage
 * 
 * Response:
 * - success: boolean
 * - data: { id, signedAt, signature, position }
 * - error: string (if failed)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SignOffRequest = await request.json();
    const { 
      position, 
      signature, 
      reviewType, 
      reviewId, 
      comments,
      userId,
      userEmail,
      userName,
      officeId 
    } = body;

    // Validate required fields
    if (!position || typeof position !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Position is required.' 
        },
        { status: 400 }
      );
    }

    if (!signature || typeof signature !== 'string' || signature.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Signature is required.' 
        },
        { status: 400 }
      );
    }

    if (!reviewType || typeof reviewType !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Review type is required.' 
        },
        { status: 400 }
      );
    }

    // Validate signature matches position (basic validation)
    const trimmedSignature = signature.trim();
    const expectedName = position.toLowerCase();
    const providedName = trimmedSignature.toLowerCase();
    
    // Allow partial match (first name or last name) or full match
    const nameParts = expectedName.split(' ');
    const isValidSignature = 
      providedName === expectedName || 
      nameParts.some(part => part.length > 2 && providedName.includes(part.toLowerCase()));

    if (!isValidSignature) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Signature must match your position name: ${position}` 
        },
        { status: 400 }
      );
    }

    // Get the sign-off store
    const signOffStore = getSignOffStore();

    // Check for duplicate sign-off within 24 hours (prevent spam)
    const userIdStr = String(userId || userEmail || 'unknown');
    const existingSignOff = signOffStore.find(
      record => 
        record.userId === userIdStr &&
        record.position === position &&
        record.reviewType === reviewType &&
        Date.now() - new Date(record.signedAt).getTime() < 24 * 60 * 60 * 1000 // 24 hours
    );

    if (existingSignOff) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already signed off on this review within the last 24 hours.',
          data: {
            existingSignOff: {
              id: existingSignOff.id,
              signedAt: existingSignOff.signedAt
            }
          }
        },
        { status: 409 } // Conflict
      );
    }

    // Create sign-off record
    const signOffRecord: SignOffRecord = {
      id: `signoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userIdStr,
      userEmail: userEmail,
      userName: userName,
      officeId: officeId,
      position,
      signature: trimmedSignature,
      reviewType,
      reviewId,
      comments,
      signedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Store the sign-off record
    // In production, this would be a database insert:
    // await db.insert(reviewSignOffs).values(signOffRecord);
    signOffStore.push(signOffRecord);

    console.log('[Sign-Off API] New sign-off recorded:', {
      id: signOffRecord.id,
      userId: signOffRecord.userId,
      userEmail: signOffRecord.userEmail,
      position: signOffRecord.position,
      signedAt: signOffRecord.signedAt
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: signOffRecord.id,
        signedAt: signOffRecord.signedAt,
        signature: signOffRecord.signature,
        position: signOffRecord.position,
        reviewType: signOffRecord.reviewType
      },
      message: 'Review signed successfully.'
    });

  } catch (error) {
    console.error('[Sign-Off API] Error processing sign-off:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while processing your sign-off. Please try again.' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/signoff
 * Retrieve sign-off history for the current user
 * 
 * Query Parameters:
 * - position: string (optional) - Filter by position
 * - reviewType: string (optional) - Filter by review type
 * - userId: number (optional) - Filter by user ID
 * - userEmail: string (optional) - Filter by user email
 * - limit: number (optional) - Limit number of results (default: 10)
 * 
 * Response:
 * - success: boolean
 * - data: SignOffRecord[]
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const reviewType = searchParams.get('reviewType');
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get the sign-off store
    const signOffStore = getSignOffStore();

    // Filter sign-offs for current user
    // In production, this would be a database query:
    // const signOffs = await db.select()
    //   .from(reviewSignOffs)
    //   .where(eq(reviewSignOffs.userId, userId))
    //   .limit(limit);
    
    let userSignOffs = signOffStore;

    // Filter by userId if provided
    if (userId) {
      userSignOffs = userSignOffs.filter(
        record => String(record.userId) === userId
      );
    }

    // Filter by userEmail if provided
    if (userEmail) {
      userSignOffs = userSignOffs.filter(
        record => record.userEmail === userEmail
      );
    }

    // Apply filters
    if (position) {
      userSignOffs = userSignOffs.filter(
        record => record.position.toLowerCase().includes(position.toLowerCase())
      );
    }

    if (reviewType) {
      userSignOffs = userSignOffs.filter(
        record => record.reviewType.toLowerCase().includes(reviewType.toLowerCase())
      );
    }

    // Sort by date (most recent first) and limit
    userSignOffs.sort((a, b) => 
      new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime()
    );
    userSignOffs = userSignOffs.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: userSignOffs.map(record => ({
        id: record.id,
        position: record.position,
        signature: record.signature,
        reviewType: record.reviewType,
        signedAt: record.signedAt
      })),
      count: userSignOffs.length
    });

  } catch (error) {
    console.error('[Sign-Off API] Error fetching sign-offs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve sign-off history.' 
      },
      { status: 500 }
    );
  }
}
