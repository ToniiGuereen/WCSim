import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { parseLang, parseTeamId } from '@/server/validation';
import { getTeamHistory } from '@/server/services/myTeam';

export const dynamic = 'force-dynamic';

export const GET = handle((req) => {
  const q = req.nextUrl.searchParams;
  const teamId = parseTeamId(q.get('teamId'));
  const lang = parseLang(q.get('lang'));
  return gateway({ path: `/my-team/history?teamId=${teamId}&lang=${lang}`, local: () => getTeamHistory(teamId, lang) });
});
