import { gateway } from '@/server/gateway';
import { handle, readJson } from '@/server/http';
import { parseFormation } from '@/server/validation';
import { updateFormation } from '@/server/services/myTeam';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const formation = parseFormation((await readJson(req)).formation);
  return gateway({ path: '/my-team/coaching/formation', method: 'POST', body: { formation }, local: () => updateFormation(formation) });
});
