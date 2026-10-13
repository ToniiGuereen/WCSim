import { gateway } from '@/server/gateway';
import { handle, readJson } from '@/server/http';
import { parseStrategy } from '@/server/validation';
import { updateStrategy } from '@/server/services/myTeam';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const strategy = parseStrategy((await readJson(req)).strategy);
  return gateway({ path: '/my-team/coaching/strategy', method: 'POST', body: { strategy }, local: () => updateStrategy(strategy) });
});
