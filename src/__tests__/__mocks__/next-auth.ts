import { Provider } from 'next-auth/providers';
import { Session } from 'next-auth';
import { mockUser } from '../mocks/user';

export const mockGoogleProvider: Provider = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  signinUrl: 'http://localhost:3000/api/auth/signin/google',
  callbackUrl: 'http://localhost:3000/api/auth/callback/google',
  clientId: 'mock-client-id',
  clientSecret: 'mock-client-secret',
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code',
    },
  },
  token: 'https://oauth2.googleapis.com/token',
  userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  profile: profile => {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

const mockSession: Session = {
  user: {
    ...mockUser,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

export function useSession() {
  return {
    data: mockSession,
    status: 'authenticated',
    update: jest.fn(),
  };
}

export function signIn() {
  return Promise.resolve({ ok: true, error: null });
}

export function signOut() {
  return Promise.resolve({ ok: true });
}

export function getSession() {
  return Promise.resolve(mockSession);
}

export default {
  useSession,
  signIn,
  signOut,
  getSession,
};
