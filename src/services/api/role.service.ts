import { apiService } from './api';

interface EligibilityResponse {
  eligible: boolean;
  requirements: string[];
}

export async function checkUpgradeEligibility(
  userId: string
): Promise<EligibilityResponse> {
  const response = await apiService.get<{ data: EligibilityResponse }>(
    `/role/upgrade-eligibility/${userId}`
  );
  return response.data; // Correctly extract the data
}

export async function upgradeRole(
  userId: string,
  newRole: string
): Promise<void> {
  await apiService.post(`/role/upgrade`, { userId, newRole });
}
