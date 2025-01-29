import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { progressService } from '@/services/user/progress.service';
import type { UserRole } from '@/utils/roleValidation';
import { useToast } from '@/hooks/use-toast';

export function useRoleTransition() {
  const { user, checkUpgradeEligibility } = useAuth();
  const [transitioning, setTransitioning] = useState(false);
  const [nextRole, setNextRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      checkUpgradeEligibility(user.id).then(
        ({
          eligible,
          nextRole: next,
        }: {
          eligible: boolean;
          nextRole: UserRole;
        }) => {
          if (eligible && next) {
            setNextRole(next);
            toast({
              title: 'Role Upgrade Available!',
              description: `You can now upgrade to ${next.replace('_', ' ')}!`,
              variant: 'default',
            });
          }
        }
      );
    }
  }, [user?.id]);

  const handleRoleTransition = async () => {
    if (!user?.id || !nextRole || transitioning) return;

    setTransitioning(true);
    try {
      await progressService.trackUserProgress(user.id);
      setTransitioning(false);
      setNextRole(null);
      toast({
        title: 'Role Upgraded!',
        description: `Successfully upgraded to ${nextRole.replace('_', ' ')}`,
        variant: 'default',
      });
    } catch (error) {
      setTransitioning(false);
      toast({
        title: 'Error',
        description: 'Failed to upgrade role. Please try again.',
        variant: 'error',
      });
    }
  };

  return {
    transitioning,
    nextRole,
    handleRoleTransition,
  };
}
