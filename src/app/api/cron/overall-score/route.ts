import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here';

interface OverallScorePayload {
  office_id?: number | string;
  score?: number;
  environment_details?: {
    current_time?: string;
    working_directory?: string;
    workspace_root_folder?: string;
    active_file?: string;
    visible_files?: string[];
    open_tabs?: string[];
  };
  timestamp?: string;
  source?: string;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: OverallScorePayload = await request.json();
    const { office_id, score, environment_details, timestamp, source } = body;

    if (typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid score. Must be a number.' }, { status: 400 });
    }

    const logData = {
      office_id: office_id ?? null,
      score,
      timestamp: timestamp || new Date().toISOString(),
      source: source || 'unknown',
      environment_details: environment_details || null
    };

    if (logData.environment_details) {
      console.log('[Cron] Overall Score received with environment details:');
      console.log(`  Current time: ${logData.environment_details.current_time || 'N/A'}`);
      console.log(`  Working directory: ${logData.environment_details.working_directory || 'N/A'}`);
      console.log(`  Workspace root folder: ${logData.environment_details.workspace_root_folder || 'N/A'}`);
      console.log(`  Active file: ${logData.environment_details.active_file || 'N/A'}`);
      console.log('  Visible files:');
      (logData.environment_details.visible_files || []).forEach((file: string) => {
        console.log(`    ${file}`);
      });
      console.log('  Open tabs:');
      (logData.environment_details.open_tabs || []).forEach((tab: string) => {
        console.log(`    ${tab}`);
      });
    } else {
      console.log('[Cron] Overall Score received:', JSON.stringify(logData, null, 2));
    }

    return NextResponse.json({ 
      success: true, 
      receivedScore: score,
      receivedAt: logData.timestamp,
      office_id: logData.office_id,
      source: logData.source
    });
  } catch (error) {
    console.error('[Cron] Error processing overall score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    endpoint: '/api/cron/overall-score',
    method: 'POST',
    description: 'Accepts office_id, score, timestamp, source, and environment_details in JSON body with Bearer token auth'
  });
}
