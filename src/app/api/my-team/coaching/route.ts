import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_COACHING } from '@/services/mockData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId') || 'arg';
  const lang = searchParams.get('lang') || 'es';
  return proxyOrFallback(`/my-team/coaching?teamId=${teamId}&lang=${lang}`, 'GET', undefined, MOCK_COACHING);
}
