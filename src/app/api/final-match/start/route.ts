import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { startFinal } from '@/server/services/finalMatch';

export const dynamic = 'force-dynamic';

export const POST = handle(() => gateway({ path: '/final-match/start', method: 'POST', body: {}, local: startFinal }));
