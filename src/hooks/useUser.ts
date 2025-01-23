import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user/user.service';
import type { User } from '@/types/user';

export function useUser() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await userService.getCurrentUser();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });

  const refreshUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      queryClient.setQueryData(['user'], userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return {
    user,
    isLoading,
    error,
    refreshUser,
  };
}
