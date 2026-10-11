import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { INITIAL_FINAL_CHAT } from '@/services/mockData';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const updated = {
    ...INITIAL_FINAL_CHAT,
    messageItems: [
      ...INITIAL_FINAL_CHAT.messageItems,
      { minute: INITIAL_FINAL_CHAT.minute, text: `Modificación táctica: Formación ajustada a ${body.formation || '4-3-3'}`, type: 'tactical' as const }
    ]
  };
  return proxyOrFallback('/final-match/formation', 'POST', body, updated);
}
