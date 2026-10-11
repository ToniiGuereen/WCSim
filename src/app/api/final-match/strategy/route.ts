import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { INITIAL_FINAL_CHAT } from '@/services/mockData';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const updated = {
    ...INITIAL_FINAL_CHAT,
    messageItems: [
      ...INITIAL_FINAL_CHAT.messageItems,
      { minute: INITIAL_FINAL_CHAT.minute, text: `Modificación táctica: Estrategia cambiada a ${body.strategy || 'EQUILIBRADO'}`, type: 'tactical' as const }
    ]
  };
  return proxyOrFallback('/final-match/strategy', 'POST', body, updated);
}
