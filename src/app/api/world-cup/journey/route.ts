import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_JOURNEY } from '@/services/mockData';

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get('teamId') || 'arg';
  const lang = request.nextUrl.searchParams.get('lang') || 'es';
  return proxyOrFallback(`/world-cup/journey?teamId=${teamId}&lang=${lang}`, 'GET', undefined, MOCK_JOURNEY);
}
