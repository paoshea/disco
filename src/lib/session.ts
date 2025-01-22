import { Session } from 'next-auth';

export const setSession = (session: Session) => {
  localStorage.setItem('auth-storage', JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const getSession = (): Session | null => {
  const data = localStorage.getItem('auth-storage');
  return data ? JSON.parse(data) : null;
};
