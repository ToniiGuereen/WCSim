import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { parseLang, parseTeamId } from '@/server/validation';
import { getJourney } from '@/server/services/worldCup';

export const dynamic = 'force-dynamic';

export const GET = handle((req) => {
  const q = req.nextUrl.searchParams;
  const teamId = parseTeamId(q.get('teamId'));
  const lang = parseLang(q.get('lang'));
  return gateway({ path: `/world-cup/journey?teamId=${teamId}&lang=${lang}`, local: () => getJourney(teamId, lang) });
});
