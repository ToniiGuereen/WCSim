import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { INITIAL_FINAL_CHAT } from '@/services/mockData';

export async function POST(request: NextRequest) {
  return proxyOrFallback('/final-match/start', 'POST', {}, INITIAL_FINAL_CHAT);
}
