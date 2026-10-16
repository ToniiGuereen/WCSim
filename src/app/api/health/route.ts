import { handle, ok } from '@/server/http';
import { sessionCount } from '@/server/engine/state';

export const dynamic = 'force-dynamic';

/** Health check para el hosting (Render/Railway/uptime monitors). */
export const GET = handle(() => ok({ status: 'up', uptimeSec: Math.round(process.uptime()), sessions: sessionCount() }));
