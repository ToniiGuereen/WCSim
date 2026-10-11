import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../../proxyHelper';
import { MOCK_COACHING } from '@/services/mockData';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const updated = {
    ...MOCK_COACHING,
    currentFormation: body.formation || MOCK_COACHING.currentFormation,
  };
  return proxyOrFallback('/my-team/coaching/formation', 'POST', body, updated);
}
