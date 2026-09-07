import { getOfficeId } from '@/utils/userContext';

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
  
  const response = await fetch('http://localhost:5000/overall-score-checkpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      office_id: officeId,
      score: score,
      type: 'executive',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save overall score checkpoint: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchScoreHistory(type = 'executive'): Promise<ScoreHistoryResponse> {
  const officeId = getOfficeId();
  
  const url = new URL('http://localhost:5000/overall-score-checkpoint');
  url.searchParams.set('office_id', String(officeId));
  url.searchParams.set('type', type);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch score history: ${response.statusText}`);
  }

  return response.json();
}
