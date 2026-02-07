/**
 * Authentication Service - Server-side functions for session management
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { query, queryOne } from './db';

const SALT_ROUNDS = 10;
const SESSION_EXPIRY_HOURS = 24;

// Session token storage (in production, use Redis or database)
interface SessionData {
  userId: number;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionStore = new Map<string, SessionData>();

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Set session cookies
 */
export async function setSession(
  userId: number,
  userData: { email: string; first_name: string; last_name: string; status: string }
): Promise<void> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  const session: SessionData = {
    userId,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    status: userData.status,
    createdAt: now,
    expiresAt,
  };
  
  sessionStore.set(token, session);
  
  // The response should set cookies - this function returns a function to create the response
  return;
}

/**
 * Get session from cookies
 */
export async function getSessionFromCookies(cookies: { get: (name: string) => { value: string } | undefined }): Promise<SessionData | null> {
  const cookie = cookies.get('user_id');
  if (!cookie) return null;
  
  const session = sessionStore.get(cookie.value);
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired
  if (new Date() > session.expiresAt) {
    sessionStore.delete(cookie.value);
    return null;
  }
  
  return session;
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<SessionData | null> {
  const session = sessionStore.get(token);
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired
  if (new Date() > session.expiresAt) {
    sessionStore.delete(token);
    return null;
  }
  
  return session;
}

/**
 * Get validated session from request
 */
export async function getValidatedSession(request: { cookies: { get: (name: string) => { value: string } | undefined } }): Promise<{ userId: number; email: string; first_name: string; last_name: string; status: string } | null> {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session) return null;
    
    return {
      userId: session.userId,
      email: session.email,
      first_name: session.first_name,
      last_name: session.last_name,
      status: session.status,
    };
  } catch {
    return null;
  }
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
 * Clear a session
 */
export async function clearSession(request: NextRequest): Promise<void> {
  // Get the session token from cookies
  const cookie = request.cookies.get('user_id');
  if (cookie) {
    sessionStore.delete(cookie.value);
  }
  // Session is cleared by removing the cookie
  sessionStore.clear();
}

/**
 * Delete session from store
 */
export async function deleteSession(token: string): Promise<void> {
  sessionStore.delete(token);
}
