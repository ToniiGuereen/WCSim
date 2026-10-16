import { CONFIG } from './config';
import { Lang, StageCode } from './domain';
import { badRequest, notFound } from './errors';
import { findTeam } from './data/catalog';
import { FORMATION_IDS, STRATEGY_IDS } from './data/tactics';
import { chooseTeam, store } from './engine/state';
import { LEGEND_IDS } from './data/legends';

export function parseLang(value: string | null | undefined): Lang {
  if (value == null || value === '') return CONFIG.defaultLang;
  const v = value.trim().toLowerCase();
  if (v === 'es' || v === 'en') return v;
  throw badRequest("Idioma inválido: usá 'es' o 'en'.");
}

/**
 * Valida el teamId. Si es una de las 10 selecciones elegibles, pasa a ser la del usuario
 * (cambiar de selección arranca una campaña nueva). Cualquier otro equipo válido solo se consulta.
 */
export function parseTeamId(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return store().myTeamId;
  const team = findTeam(value);
  if (!team) throw notFound(`Equipo no encontrado: "${value.trim()}".`);
  if (LEGEND_IDS.includes(team.id)) chooseTeam(team.id);
  return team.id;
}

const STAGES: StageCode[] = ['GROUPS', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'];

export function parseStage(value: string | null | undefined): StageCode | undefined {
  if (value == null || value.trim() === '' || value.trim().toUpperCase() === 'ALL') return undefined;
  const v = value.trim().toUpperCase() as StageCode;
  if (!STAGES.includes(v)) throw badRequest(`Fase inválida. Valores permitidos: ALL, ${STAGES.join(', ')}.`);
  return v;
}

export function parseStrategy(value: unknown): string {
  const v = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!STRATEGY_IDS.includes(v)) throw badRequest(`Estrategia inválida. Valores permitidos: ${STRATEGY_IDS.join(', ')}.`);
  return v;
}

export function parseFormation(value: unknown): string {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!FORMATION_IDS.includes(v)) throw badRequest(`Formación inválida. Valores permitidos: ${FORMATION_IDS.join(', ')}.`);
  return v;
}

export function parseOption(value: unknown): number {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1 || n > 4) {
    throw badRequest('selectedOption debe ser un entero entre 1 y 4.');
  }
  return n;
}

/** Valida que el teamId sea una de las 10 selecciones elegibles. */
export function parseSelectableTeam(value: unknown): string {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!id) throw badRequest('Falta teamId.');
  if (!findTeam(id)) throw notFound(`Equipo no encontrado: "${id}".`);
  if (!LEGEND_IDS.includes(id)) throw badRequest(`Solo podés elegir una de las 10 selecciones históricas: ${LEGEND_IDS.join(', ')}.`);
  return id;
}
