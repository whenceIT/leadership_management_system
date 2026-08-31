import { getOfficeId } from '@/utils/userContext';

export interface OverallScoreCheckpointResponse {
  message: string;
}

export async function saveOverallScoreCheckpoint(score: number): Promise<OverallScoreCheckpointResponse> {
  const officeId = getOfficeId();
  
  const response = await fetch('https://smartbackend.whencefinancesystem.com/overall-score-checkpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      office_id: officeId,
      score: score,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save overall score checkpoint: ${response.statusText}`);
  }

  return response.json();
}
