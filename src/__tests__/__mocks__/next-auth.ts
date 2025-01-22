import { Session } from 'next-auth';
import { mockUser } from './user';

export const mockSession: Session = {
  user: mockUser,
  expires: '2025-01-21T22:12:49.000Z',
};

const nextAuth = jest.fn(() => ({
  auth: {
    session: mockSession,
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

export default nextAuth;

// Mock the useSession hook
export const useSession = jest.fn(() => ({
  data: mockSession,
  status: 'authenticated',
  update: jest.fn(),
}));

// Mock the signIn and signOut functions
export const signIn = jest.fn().mockImplementation((provider, options) => {
  if (options?.email === 'test@example.com' && options?.password === 'password123') {
    return Promise.resolve({ ok: true, error: null });
  }
  return Promise.resolve({ ok: false, error: 'Invalid credentials' });
});

export const signOut = jest.fn().mockImplementation(() => Promise.resolve({ ok: true }));

// Mock the getSession function
export const getSession = jest.fn().mockImplementation(() => Promise.resolve(mockSession));
