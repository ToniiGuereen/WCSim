import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { MOCK_SIMULATION } from '@/services/mockData';

export async function POST(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') || 'es';
  const updatedSimulation = {
    ...MOCK_SIMULATION,
    status: 'READY_FOR_FINAL' as const,
  };
  return proxyOrFallback(`/world-cup/simulate?lang=${lang}`, 'POST', {}, updatedSimulation);
}
