import { Provider } from 'next-auth/providers';

export const mockGoogleProvider: Provider = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
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

export const mockNextAuth = {
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(),
};
