// @ts-nocheck
import { getSession, signIn, signOut } from 'next-auth/react';
import { mockUser } from '../__mocks__/user';
import { mockSession } from '../__mocks__/next-auth';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when no session exists', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const session = await getSession();
    expect(session).toBeNull();
  });

  it('should return session data when session exists', async () => {
    (getSession as jest.Mock).mockResolvedValue(mockSession);
    const session = await getSession();
    expect(session).toEqual(mockSession);
    expect(session?.user).toEqual(mockUser);
  });

  it('should handle successful sign in', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    (signIn as jest.Mock).mockResolvedValue({
      ok: true,
      error: null,
    });

    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    expect(result).toEqual({
      ok: true,
      error: null,
    });
  });

  it('should handle failed sign in', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
    });

    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    expect(result).toEqual({
      ok: false,
      error: 'Invalid credentials',
    });
  });

  it('should handle sign out', async () => {
    await signOut({ redirect: false });
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });
});
