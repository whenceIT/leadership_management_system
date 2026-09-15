import { getOfficeId, getUserRole } from '@/utils/userContext';

export interface OverallScoreCheckpointResponse {
  message: string;
}

export interface ScoreHistoryItem {
  id: number;
  office_id: number;
  score: string;
  type: string;
  created_at: string;
}

export interface ScoreHistoryResponse {
  success: boolean;
  office_id: string;
  count: number;
  data: ScoreHistoryItem[];
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
      type: getUserRole(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save overall score checkpoint: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchScoreHistory(type?: string): Promise<ScoreHistoryResponse> {
  const officeId = getOfficeId();
  const roleType = type ?? getUserRole();
  
  const url = new URL('https://smartbackend.whencefinancesystem.com/overall-score-checkpoint');
  url.searchParams.set('office_id', String(officeId));
  url.searchParams.set('type', roleType);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch score history: ${response.statusText}`);
  }

  return response.json();
}
