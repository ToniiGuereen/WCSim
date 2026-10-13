import { FinalChatState, LiveEventItem, TeamStateData } from '@/types';
import { conflict } from '../errors';
import { FinalSession, createSession, play, setFormation, setStrategy, toChatState, toLiveEvents, toMatchRecord, toTeamState } from '../engine/final';
import { store, teamConfig } from '../engine/state';
import { clearFinal, recordFinal } from '../engine/tournament';
import { randomSeed } from '../rng';
import { finalPairing } from './worldCup';

const NOT_SIMULATED = 'Primero debe simularse el Mundial para jugar la Final.';
const NO_FINAL = 'No hay una final en curso. Iniciá la Gran Final primero.';

function active(): FinalSession {
  const s = store().finalSession;
  if (!s) throw conflict(store().tournament.simulated ? NO_FINAL : NOT_SIMULATED);
  return s;
}

/** Inicia (o reinicia) la final entre los dos finalistas del torneo simulado. */
export function startFinal(): FinalChatState {
  const s = store();
  const pairing = finalPairing();
  if (!pairing) throw conflict(NOT_SIMULATED);

  clearFinal(s.tournament); // una final nueva reemplaza al resultado anterior
  const cfg = (id: string) => ({ ...teamConfig(id) });
  s.finalSession = createSession(pairing.userId, pairing.oppId, cfg(pairing.userId), cfg(pairing.oppId), randomSeed());
  return toChatState(s.finalSession);
}

export function playTurn(option: number): FinalChatState {
  const s = store();
  const session = active();
  play(session, option);
  if (session.finished) {
    const nextNumber = Math.max(0, ...s.tournament.matches.map((m) => m.number)) + 1;
    recordFinal(s.tournament, toMatchRecord(session, nextNumber));
  }
  return toChatState(session);
}

export function changeStrategy(strategy: string): FinalChatState {
  const session = active();
  setStrategy(session, strategy);
  return toChatState(session);
}

export function changeFormation(formation: string): FinalChatState {
  const session = active();
  setFormation(session, formation);
  return toChatState(session);
}

export const getTeamState = (): TeamStateData => toTeamState(active());

/** Sin final iniciada la línea de tiempo está vacía (el frontend muestra "Sin eventos registrados"). */
export function getLiveEvents(): LiveEventItem[] {
  const session = store().finalSession;
  return session ? toLiveEvents(session) : [];
}
