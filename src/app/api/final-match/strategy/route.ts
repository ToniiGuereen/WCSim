import { gateway } from '@/server/gateway';
import { handle, readJson } from '@/server/http';
import { parseStrategy } from '@/server/validation';
import { changeStrategy } from '@/server/services/finalMatch';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const strategy = parseStrategy((await readJson(req)).strategy);
  return gateway({ path: '/final-match/strategy', method: 'POST', body: { strategy }, local: () => changeStrategy(strategy) });
});
