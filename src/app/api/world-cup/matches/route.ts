import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_MATCHES } from '@/services/mockData';

export async function GET(request: NextRequest) {
  const stage = request.nextUrl.searchParams.get('stage');
  const lang = request.nextUrl.searchParams.get('lang') || 'es';
  const query = stage ? `?stage=${stage}&lang=${lang}` : `?lang=${lang}`;
  
  let filtered = MOCK_MATCHES;
  if (stage && stage !== 'ALL') {
    filtered = MOCK_MATCHES.filter((m) => m.stage === stage);
  }

  return proxyOrFallback(`/world-cup/matches${query}`, 'GET', undefined, filtered);
}
