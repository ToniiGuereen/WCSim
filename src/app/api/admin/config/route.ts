import { gateway } from '@/server/gateway';
import { handle } from '@/server/http';
import { adminConfig } from '@/server/services/myTeam';

export const dynamic = 'force-dynamic';

export const GET = handle(() => gateway({ path: '/admin/config', local: adminConfig }));
