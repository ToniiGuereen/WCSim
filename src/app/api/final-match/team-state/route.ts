import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_TEAM_STATE } from '@/services/mockData';

export async function GET(request: NextRequest) {
  return proxyOrFallback('/final-match/team-state', 'GET', undefined, MOCK_TEAM_STATE);
}
