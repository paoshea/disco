import * as jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'development-secret-key-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set in production');
}

/**
 * @typedef {Object} UserPayload
 * @property {string} id
 * @property {string} email
 */

/**
 * @typedef {Object} JWTPayload
 * @property {string} userId
 * @property {string} email
 */

export interface UserPayload {
  id: string;
  email: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * @param {UserPayload} user
 * @returns {string}
 */
export function generateToken(user: UserPayload): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  return jsonwebtoken.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jsonwebtoken.SignOptions);
}

/**
 * @param {string} token
 * @returns {JWTPayload}
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jsonwebtoken.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * @param {string} token
 * @returns {JWTPayload | null}
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jsonwebtoken.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
