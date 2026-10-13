import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { parseLang } from '@/server/validation';
import { getHistory } from '@/server/services/worldCup';

export const dynamic = 'force-dynamic';

export const GET = handle((req) => {
  const lang = parseLang(req.nextUrl.searchParams.get('lang'));
  return gateway({ path: `/world-cup/history?lang=${lang}`, local: () => getHistory(lang) });
});
