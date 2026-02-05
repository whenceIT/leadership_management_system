import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { queryOne } from './db';

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = 'user_id';
const SESSION_EXPIRY_DAYS = 1; // 1 day = 24 hours

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Set session cookie
export async function setSession(userId: number, userData: any) {
  const cookieStore = await cookies();
  
  // Set user session data
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS, // 24 hours (1 day)
    path: '/',
  });

  cookieStore.set('user_email', userData.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  cookieStore.set('user_name', `${userData.first_name} ${userData.last_name}`, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  cookieStore.set('user_status', userData.status, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

// Clear session cookies
export async function clearSession() {
  const cookieStore = await cookies();
  
  cookieStore.delete('user_id');
  cookieStore.delete('user_email');
  cookieStore.delete('user_name');
  cookieStore.delete('user_status');
}

// Get current session
export async function getSession() {
  const cookieStore = await cookies();
  
  const userId = cookieStore.get('user_id')?.value;
  const userEmail = cookieStore.get('user_email')?.value;
  const userName = cookieStore.get('user_name')?.value;
  const userStatus = cookieStore.get('user_status')?.value;

  if (!userId || !userEmail) {
    return null;
  }

  return {
    userId: parseInt(userId),
    email: userEmail,
    name: userName,
    status: userStatus,
  };
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

// Get user from database by ID
export async function getUserById(userId: number) {
  const sql = `
    SELECT id, email, first_name, last_name, status, 
           phone, gender, office_id, permissions, 
           enable_google2fa, blocked, last_login
    FROM users 
    WHERE id = ?
  `;
  
  return await queryOne(sql, [userId]);
}

// Get user from database by email
export async function getUserByEmail(email: string) {
  const sql = `
    SELECT id, email, password, first_name, last_name, status, 
           phone, gender, office_id, permissions, 
           enable_google2fa, blocked, last_login
    FROM users 
    WHERE email = ?
  `;
  
  return await queryOne(sql, [email]);
}

// Update last login timestamp
export async function updateLastLogin(userId: number) {
  const sql = `
    UPDATE users 
    SET last_login = NOW() 
    WHERE id = ?
  `;
  
  await queryOne(sql, [userId]);
}

// Validate session and check if it's expired
export async function validateSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!userId) {
    return false;
  }
  
  // Check if user exists in database
  const user = await getUserById(parseInt(userId));
  
  if (!user) {
    // User doesn't exist, clear session
    await clearSession();
    return false;
  }
  
  // Check if user is blocked
  if (user && 'blocked' in user && user.blocked) {
    await clearSession();
    return false;
  }
  
  return true;
}

// Get session with validation
export async function getValidatedSession() {
  const isValid = await validateSession();
  
  if (!isValid) {
    return null;
  }
  
  return await getSession();
}

// Redirect to login if session is invalid
export async function requireAuth(): Promise<{ userId: number; email: string; name: string | undefined; status: string | undefined } | null> {
  const session = await getValidatedSession();
  
  if (!session) {
    return null;
  }
  
  return session;
}
