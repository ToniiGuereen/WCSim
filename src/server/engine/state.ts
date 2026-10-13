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
 * Estado en memoria del proceso. Va en globalThis porque en `next dev` cada route handler
 * puede cargarse en un bundle distinto y un singleton de módulo no se compartiría.
 * App de un solo usuario: el estado es global al servidor.
 */
const g = globalThis as unknown as { __wcStore?: Store };

export function store(): Store {
  if (!g.__wcStore) {
    g.__wcStore = {
      myTeamId: findTeam(CONFIG.defaultTeamId)?.id ?? 'arg',
      teamConfig: {},
      tournament: createDraw(CONFIG.fixedSeed ?? randomSeed()),
    };
  }
  return g.__wcStore;
}

export function teamConfig(teamId: string): TeamConfig {
  const s = store();
  if (!s.teamConfig[teamId]) {
    const team = mustTeam(teamId);
    s.teamConfig[teamId] = { strategy: team.strategy, formation: team.formation };
  }
  return s.teamConfig[teamId];
}

export function selectTeam(teamId: string): void {
  store().myTeamId = teamId;
}

export function tournamentStatus(): TournamentStatus {
  const { tournament: t, finalSession } = store();
  if (!t.simulated) return 'PENDING';
  if (finalSession && !finalSession.finished) return 'FINAL_ACTIVE';
  if (t.championId) return 'ENDED';
  return 'READY_FOR_FINAL';
}
