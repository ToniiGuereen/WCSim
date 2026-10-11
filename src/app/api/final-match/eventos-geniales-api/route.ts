import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_LIVE_EVENTS } from '@/services/mockData';

export async function GET(request: NextRequest) {
  return proxyOrFallback('/final-match/eventos-geniales-api', 'GET', undefined, MOCK_LIVE_EVENTS);
}
