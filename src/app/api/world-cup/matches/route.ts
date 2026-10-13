import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { parseLang, parseStage } from '@/server/validation';
import { getMatches } from '@/server/services/worldCup';

export const dynamic = 'force-dynamic';

export const GET = handle((req) => {
  const q = req.nextUrl.searchParams;
  const stage = parseStage(q.get('stage'));
  const lang = parseLang(q.get('lang'));
  const query = stage ? `?stage=${stage}&lang=${lang}` : `?lang=${lang}`;
  return gateway({ path: `/world-cup/matches${query}`, local: () => getMatches(stage, lang) });
});
