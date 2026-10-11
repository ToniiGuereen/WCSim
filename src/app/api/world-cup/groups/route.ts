import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_GROUPS } from '@/services/mockData';

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') || 'es';
  return proxyOrFallback(`/world-cup/groups?lang=${lang}`, 'GET', undefined, MOCK_GROUPS);
}
