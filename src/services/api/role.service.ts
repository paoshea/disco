import { apiService } from './api';
import axios from 'axios';

interface ApiResponse<T> {
  data: T;
}

interface EligibilityResponse {
  eligible: boolean;
  requirements: string[];
}

export async function checkUpgradeEligibility(userId: string): Promise<EligibilityResponse> {
  try {
    const response = await axios.get<ApiResponse<EligibilityResponse>>(
      `/api/upgrade-eligibility/${userId}`
    );
    return response.data.data; // Correctly extract the nested data
  } catch (error) {
    throw new Error('Failed to check upgrade eligibility');
  }
}

export async function upgradeRole(
  userId: string,
  newRole: string
): Promise<void> {
  await apiService.post(`/role/upgrade`, { userId, newRole });
}
