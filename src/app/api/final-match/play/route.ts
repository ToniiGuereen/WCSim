import { gateway } from '@/server/gateway';
import { handle, readJson } from '@/server/http';
import { parseOption } from '@/server/validation';
import { playTurn } from '@/server/services/finalMatch';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const body = await readJson(req);
  const selectedOption = parseOption(body.selectedOption);
  return gateway({ path: '/final-match/play', method: 'POST', body: { selectedOption }, local: () => playTurn(selectedOption) });
});
