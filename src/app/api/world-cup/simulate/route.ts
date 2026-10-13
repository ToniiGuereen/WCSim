import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { parseLang } from '@/server/validation';
import { runSimulation } from '@/server/services/worldCup';

export const dynamic = 'force-dynamic';

export const POST = handle((req) => {
  const lang = parseLang(req.nextUrl.searchParams.get('lang'));
  return gateway({ path: `/world-cup/simulate?lang=${lang}`, method: 'POST', body: {}, heavy: true, local: () => runSimulation(lang) });
});
