import { gateway } from '@/server/gateway';
import { handle, readJson } from '@/server/http';
import { parseFormation } from '@/server/validation';
import { changeFormation } from '@/server/services/finalMatch';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const formation = parseFormation((await readJson(req)).formation);
  return gateway({ path: '/final-match/formation', method: 'POST', body: { formation }, local: () => changeFormation(formation) });
});
