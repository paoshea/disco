import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  checkUpgradeEligibility,
  upgradeRole,
} from '../../services/api/role.service';

interface EligibilityResponse {
  eligible: boolean;
  requirements: string[];
}

export const RoleUpgrade = () => {
  const { user } = useAuth(); // Only get user from useAuth
  const [requirements, setRequirements] = React.useState<string[]>([]);
  const [isEligible, setIsEligible] = React.useState(false);

  React.useEffect(() => {
    if (user?.id) {
      void checkUpgradeEligibility(user.id).then(
        ({ eligible, requirements }: EligibilityResponse) => {
          setIsEligible(eligible);
          setRequirements(requirements);
        }
      );
    }
  }, [user?.id]);

  const handleUpgrade = async () => {
    if (user?.id) {
      await upgradeRole(user.id, 'power_user');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Upgrade to Power User</h3>
      {isEligible ? (
        <div>
          <p className="mb-4">You are eligible for a Power User upgrade!</p>
          <Button onClick={() => void handleUpgrade()}>Upgrade Now</Button>{' '}
          {/* ✅ Fixed */}
        </div>
      ) : (
        <div>
          <p className="mb-4">Complete these requirements to upgrade:</p>
          <ul className="list-disc pl-5">
            {requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
