import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';

export async function GET(request: NextRequest) {
  const teamId = process.env.NEXT_PUBLIC_TEAM_ID || 'arg';
  const lang = process.env.NEXT_PUBLIC_APP_LANG || 'es';
  return proxyOrFallback('/admin/config', 'GET', undefined, { teamId, lang });
}
