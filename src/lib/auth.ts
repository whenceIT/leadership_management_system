/**
 * Authentication Service - Server-side functions for session management
 * Follows the AuthLogic.md specification
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from './db';

const SESSION_EXPIRY_HOURS = 24;

// Session storage interface
interface SessionData {
  session_id: string;
  user_id: number;
  office_id?: number;
  role?: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: Date;
  expires_at: Date;
}

// In-memory session store (in production, use Redis or database)
const sessionStore = new Map<string, SessionData>();

/**
 * Generate a secure session ID (Node.js version - for API routes)
 */
export function generateSessionId(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure session ID (Web Crypto API - for middleware)
 */
export function generateSessionIdWeb(): string {
  const array = new Uint8Array(32);
  self.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new session (Server Action)
 * Step 1: Save session server-side
 */
export async function createSession(
  userId: number,
  userData: {
    office_id?: number;
    role?: string;
    email: string;
    first_name: string;
    last_name: string;
    status: string;
  }
): Promise<string> {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  const session: SessionData = {
    session_id: sessionId,
    user_id: userId,
    office_id: userData.office_id,
    role: userData.role,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    status: userData.status,
    created_at: now,
    expires_at: expiresAt,
  };

  // Store in memory (in production, save to database)
  sessionStore.set(sessionId, session);

  return sessionId;
}

/**
 * Session Resolver (Step 3) - Web Crypto API for middleware
 * Single utility: Reads cookie, fetches session, returns null if invalid
 */
export async function resolveSession(request: NextRequest): Promise<SessionData | null> {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return null;
    }

    const session = sessionStore.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expires_at) {
      sessionStore.delete(sessionId);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Get session by session ID (for API routes)
 */
export async function getSessionById(sessionId: string): Promise<SessionData | null> {
  const session = sessionStore.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session has expired
  if (new Date() > session.expires_at) {
    sessionStore.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Delete session server-side (Step 6)
 */
export async function deleteSession(request: NextRequest): Promise<void> {
  const sessionId = request.cookies.get('session_id')?.value;
  
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
}

/**
 * Delete session by ID
 */
export async function deleteSessionById(sessionId: string): Promise<void> {
  sessionStore.delete(sessionId);
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const crypto = require('crypto');
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * Get user by ID from database
 */
export async function getUserById(userId: number): Promise<any> {
  try {
    const user = await queryOne(
      `SELECT id, email, first_name, last_name, status, phone, gender, office_id, enable_google2fa, permissions, last_login, blocked 
       FROM users WHERE id = ?`,
      [userId]
    );
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Create session response with cookie
 */
export function createSessionResponse(
  sessionId: string,
  data: object,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });

  // Set session cookie
  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}

/**
 * Create logout response
 */
export function createLogoutResponse(): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Delete session cookie
  response.cookies.delete('session_id');

  return response;
}
