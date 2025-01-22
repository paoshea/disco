import { storage } from '../storage';

const SESSION_KEY = 'session';

export const setSession = (session: any): void => {
  storage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = (): any | null => {
  const session = storage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const clearSession = (): void => {
  storage.removeItem(SESSION_KEY);
};
