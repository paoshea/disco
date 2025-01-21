import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { userService } from '@/services/api/user.service';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch user')
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, []);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, refreshUser };
}
