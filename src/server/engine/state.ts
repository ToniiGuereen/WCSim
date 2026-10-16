import { headers } from 'next/headers';
import { CONFIG } from '../config';
import { Tournament } from '../domain';
import { findTeam, mustTeam } from '../data/catalog';
import { randomSeed } from '../rng';
import type { FinalSession } from './final';
import { createDraw } from './tournament';

export interface TeamConfig {
  strategy: string;
  formation: string;
}

export interface Store {
  /** Equipo "activo" del usuario (último teamId válido recibido). Define quién controla la Final. */
  myTeamId: string;
  teamConfig: Record<string, TeamConfig>;
  tournament: Tournament;
  finalSession?: FinalSession;
}

export type TournamentStatus = 'PENDING' | 'READY_FOR_FINAL' | 'FINAL_ACTIVE' | 'ENDED';

/**
 * Estado en memoria, UNO POR VISITANTE. El middleware asigna una cookie `wc_sid` y la reenvía
 * como header `x-wc-sid`; acá se usa como clave. Va en globalThis porque en `next dev` cada
 * route handler puede cargarse en un bundle distinto y un Map de módulo no se compartiría.
 * Las sesiones inactivas vencen (WC_SESSION_TTL_MIN) y hay un tope (WC_MAX_SESSIONS, se descarta la menos usada).
 */
interface Entry {
  store: Store;
  lastUsed: number;
}
const g = globalThis as unknown as { __wcSessions?: Map<string, Entry>; __wcSweptAt?: number };
const sessions = (): Map<string, Entry> => (g.__wcSessions ??= new Map());

function currentSid(): string {
  try {
    return headers().get('x-wc-sid') || 'anon';
  } catch {
    return 'anon'; // fuera de un request (scripts, tests unitarios)
  }
}

function newStore(): Store {
  return {
    myTeamId: findTeam(CONFIG.defaultTeamId)?.id ?? 'arg',
    teamConfig: {},
    tournament: createDraw(CONFIG.fixedSeed ?? randomSeed()),
  };
}

function evict(now: number): void {
  const map = sessions();
  const ttl = CONFIG.sessionTtlMs;
  // Barrido de vencidas como mucho una vez por minuto
  if (now - (g.__wcSweptAt ?? 0) > 60_000) {
    g.__wcSweptAt = now;
    for (const [id, e] of map) if (now - e.lastUsed > ttl) map.delete(id);
  }
  // Tope: descarta las menos usadas
  while (map.size >= CONFIG.maxSessions) {
    let oldest: string | undefined;
    let t = Infinity;
    for (const [id, e] of map) if (e.lastUsed < t) { t = e.lastUsed; oldest = id; }
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

export function store(): Store {
  const sid = currentSid();
  const map = sessions();
  const now = Date.now();
  let entry = map.get(sid);
  if (entry && now - entry.lastUsed > CONFIG.sessionTtlMs) {
    map.delete(sid);
    entry = undefined;
  }
  if (!entry) {
    evict(now);
    entry = { store: newStore(), lastUsed: now };
    map.set(sid, entry);
  }
  entry.lastUsed = now;
  return entry.store;
}

/** Cantidad de sesiones vivas (health check / monitoreo). */
export const sessionCount = (): number => sessions().size;

export function teamConfig(teamId: string): TeamConfig {
  const s = store();
  if (!s.teamConfig[teamId]) {
    const team = mustTeam(teamId);
    s.teamConfig[teamId] = { strategy: team.strategy, formation: team.formation };
  }
  return s.teamConfig[teamId];
}

/**
 * Elige la selección del usuario. Si cambia, arranca una campaña nueva:
 * sorteo nuevo sin simular y Final en curso descartada (la campaña anterior era de otro equipo).
 */
export function chooseTeam(teamId: string): boolean {
  const s = store();
  if (s.myTeamId === teamId) return false;
  s.myTeamId = teamId;
  s.tournament = createDraw(CONFIG.fixedSeed ?? randomSeed());
  s.finalSession = undefined;
  return true;
}

export function tournamentStatus(): TournamentStatus {
  const { tournament: t, finalSession } = store();
  if (!t.simulated) return 'PENDING';
  if (finalSession && !finalSession.finished) return 'FINAL_ACTIVE';
  if (t.championId) return 'ENDED';
  return 'READY_FOR_FINAL';
}
