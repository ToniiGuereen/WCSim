import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_WC_HISTORY } from '@/services/mockData';

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') || 'es';
  return proxyOrFallback(`/world-cup/history?lang=${lang}`, 'GET', undefined, MOCK_WC_HISTORY);
}
