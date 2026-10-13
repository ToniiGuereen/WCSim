import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { getLiveEvents } from '@/server/services/finalMatch';

export const dynamic = 'force-dynamic';

export const GET = handle(() => gateway({ path: '/final-match/eventos-geniales-api', local: getLiveEvents }));
