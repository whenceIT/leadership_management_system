import cron from 'node-cron';

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const OFFICE_ID = process.env.OFFICE_ID || '1';

interface EnvironmentDetails {
  current_time: string;
  working_directory: string;
  workspace_root_folder: string;
  active_file: string;
  visible_files: string[];
  open_tabs: string[];
}

const getEnvironmentDetails = (): EnvironmentDetails => ({
  current_time: new Date().toISOString(),
  working_directory: process.cwd(),
  workspace_root_folder: process.cwd(),
  active_file: 'cron/overall-score-worker.ts',
  visible_files: ['cron/overall-score-worker.ts'],
  open_tabs: [
    'cron/overall-score-worker.ts',
    'src/app/api/cron/overall-score/route.ts',
    'src/components/dashboards/InstitutionalHealthSummary.tsx'
  ]
});

const getOverallScore = async (): Promise<number> => {
  // TODO: Replace with actual score fetching logic
  // For now, using a placeholder. Integrate with your score calculation service.
  return 0;
};

const postOverallScore = async (score: number) => {
  try {
    const payload = {
      office_id: OFFICE_ID,
      score,
      timestamp: new Date().toISOString(),
      source: 'cron-worker',
      environment_details: getEnvironmentDetails()
    };

    const response = await fetch(`${API_URL}/api/cron/overall-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CronWorker] Failed: ${response.status} ${response.statusText} - ${text}`);
    } else {
      const result = await response.json();
      console.log(`[CronWorker] Posted score ${score} at ${new Date().toISOString()}:`, JSON.stringify(result));
    }
  } catch (error) {
    console.error('[CronWorker] Error:', error);
  }
};

// Run every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
  const currentScore = await getOverallScore();
  await postOverallScore(currentScore);
});

// Test endpoint - run once on startup
const runTest = async () => {
  console.log('[CronWorker] Running startup test...');
  const testScore = await getOverallScore();
  await postOverallScore(testScore);
};

runTest();

console.log('[CronWorker] Started - posting overall score every 5 seconds');
console.log(`[CronWorker] API URL: ${API_URL}`);
console.log(`[CronWorker] Office ID: ${OFFICE_ID}`);
console.log('[CronWorker] Press Ctrl+C to stop');
