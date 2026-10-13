import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { getTeamState } from '@/server/services/finalMatch';

export const dynamic = 'force-dynamic';

export const GET = handle(() => gateway({ path: '/final-match/team-state', local: getTeamState }));
