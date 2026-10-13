import { CONFIG } from './config';
import { Lang, StageCode } from './domain';
import { badRequest, notFound } from './errors';
import { findTeam } from './data/catalog';
import { FORMATION_IDS, STRATEGY_IDS } from './data/tactics';
import { selectTeam, store } from './engine/state';

export function parseLang(value: string | null | undefined): Lang {
  if (value == null || value === '') return CONFIG.defaultLang;
  const v = value.trim().toLowerCase();
  if (v === 'es' || v === 'en') return v;
  throw badRequest("Idioma inválido: usá 'es' o 'en'.");
}

/** Valida el teamId. Si viene explícito y es válido, pasa a ser el equipo activo del usuario. */
export function parseTeamId(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return store().myTeamId;
  const team = findTeam(value);
  if (!team) throw notFound(`Equipo no encontrado: "${value.trim()}".`);
  selectTeam(team.id);
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
