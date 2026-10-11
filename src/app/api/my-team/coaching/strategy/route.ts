import { NextRequest, NextResponse } from 'next/server';
import { proxyOrFallback } from '../../../proxyHelper';
import { MOCK_COACHING } from '@/services/mockData';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const updated = {
    ...MOCK_COACHING,
    currentStrategy: body.strategy || MOCK_COACHING.currentStrategy,
  };
  return proxyOrFallback('/my-team/coaching/strategy', 'POST', body, updated);
}
