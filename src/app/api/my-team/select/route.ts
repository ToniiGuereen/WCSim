import { handle, ok, readJson } from '@/server/http';
import { parseLang, parseSelectableTeam } from '@/server/validation';
import { getTeamSelection, selectMyTeam } from '@/server/services/myTeam';

export const dynamic = 'force-dynamic';

/** Lista las 10 selecciones elegibles y marca la elegida. Siempre lo resuelve el motor local. */
export const GET = handle((req) => ok(getTeamSelection(parseLang(req.nextUrl.searchParams.get('lang')))));

/** Elige selección: { teamId, lang? }. Cambiar de selección reinicia la campaña. */
export const POST = handle(async (req) => {
  const body = await readJson(req);
  const teamId = parseSelectableTeam(body.teamId);
  const lang = parseLang(typeof body.lang === 'string' ? body.lang : req.nextUrl.searchParams.get('lang'));
  return ok(selectMyTeam(teamId, lang));
});
