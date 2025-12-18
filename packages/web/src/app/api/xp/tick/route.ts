import { NextRequest } from 'next/server';
import { handleXpAward } from '../_lib/award';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handleXpAward(req, 'tick');
}
