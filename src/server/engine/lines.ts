import { Position, SquadPlayer } from '../domain';
import { FORMATION_MOD, FORMATION_SHAPE, STRATEGY_MOD } from '../data/tactics';
import { getSquad } from '../data/squads';
import { Rng } from '../rng';

export interface LivePlayer extends SquadPlayer {
  energyNow: number;
  yellows: number;
}

export interface Side {
  teamId: string;
  formation: string;
  strategy: string;
  onField: LivePlayer[];
  bench: LivePlayer[];
  /** Jugadores ya reemplazados o expulsados (no pueden volver). */
  out: LivePlayer[];
  subsUsed: number;
}

export interface Lines {
  attack: number;
  midfield: number;
  defense: number;
  gk: number;
}

export const MAX_SUBS = 5;

export const toLive = (p: SquadPlayer): LivePlayer => ({ ...p, energyNow: p.energy, yellows: 0 });

const energyFactor = (p: { energyNow: number }) => 0.72 + (0.28 * Math.min(100, Math.max(0, p.energyNow))) / 100;
const score = (p: LivePlayer) => p.skill * energyFactor(p);

/** Arma el once titular según la formación: mejores jugadores por línea, ponderados por energía. */
export function pickLineup(players: LivePlayer[], formation: string): { onField: LivePlayer[]; bench: LivePlayer[] } {
  const shape = FORMATION_SHAPE[formation] ?? FORMATION_SHAPE['4-3-3'];
  const need: Record<Position, number> = { GK: 1, DF: shape.DF, MF: shape.MF, FW: shape.FW };
  const onField: LivePlayer[] = [];

  (['GK', 'DF', 'MF', 'FW'] as Position[]).forEach((pos) => {
    const candidates = players.filter((p) => p.position === pos).sort((a, b) => score(b) - score(a));
    onField.push(...candidates.slice(0, need[pos]));
  });

  if (onField.length < 11) {
    const rest = players.filter((p) => !onField.includes(p) && p.position !== 'GK').sort((a, b) => score(b) - score(a));
    onField.push(...rest.slice(0, 11 - onField.length));
  }
  return { onField, bench: players.filter((p) => !onField.includes(p)) };
}

export function buildSide(teamId: string, formation: string, strategy: string): Side {
  const { onField, bench } = pickLineup(getSquad(teamId).map(toLive), formation);
  return { teamId, formation, strategy, onField, bench, out: [], subsUsed: 0 };
}

/** Líneas efectivas del equipo (ataque / medio / defensa / arquero) con táctica, físico y hombres en cancha. */
export function teamLines(side: Pick<Side, 'onField' | 'formation' | 'strategy'>): Lines {
  const avg = (items: LivePlayer[], fn: (p: LivePlayer) => number, fallback = 45) =>
    items.length ? items.reduce((sum, p) => sum + fn(p), 0) / items.length : fallback;
  const eff = (p: LivePlayer, value: number) => value * energyFactor(p);

  const fw = side.onField.filter((p) => p.position === 'FW');
  const mf = side.onField.filter((p) => p.position === 'MF');
  const df = side.onField.filter((p) => p.position === 'DF');
  const gk = side.onField.find((p) => p.position === 'GK');

  let attack = fw.length ? 0.7 * avg(fw, (p) => eff(p, p.attack)) + 0.3 * avg(mf, (p) => eff(p, p.attack)) : avg(mf, (p) => eff(p, p.attack));
  let midfield = avg(mf, (p) => eff(p, (p.skill + p.attack + p.defense) / 3));
  let defense = 0.75 * avg(df, (p) => eff(p, p.defense)) + 0.25 * avg(mf, (p) => eff(p, p.defense));

  const sm = STRATEGY_MOD[side.strategy] ?? STRATEGY_MOD.EQUILIBRADO;
  const fm = FORMATION_MOD[side.formation] ?? FORMATION_MOD['4-3-3'];
  const men = 0.6 + (0.4 * side.onField.length) / 11; // expulsiones debilitan al equipo

  attack *= sm.attack * fm.attack * men;
  midfield *= sm.midfield * fm.midfield * men;
  defense *= sm.defense * fm.defense * men;

  return { attack, midfield, defense, gk: gk ? eff(gk, gk.defense) : 40 };
}

export const roundLines = (l: Lines) => ({
  attack: Math.round(l.attack),
  midfield: Math.round(l.midfield),
  defense: Math.round(l.defense),
});

/** Tanda de penales con corte anticipado y muerte súbita. */
export function runShootout(rng: Rng, pHome: number, pAway: number): { home: number; away: number } {
  let home = 0;
  let away = 0;
  let homeKicks = 0;
  let awayKicks = 0;
  const decided = () => home > away + (5 - awayKicks) || away > home + (5 - homeKicks);

  for (let i = 0; i < 5 && !decided(); i++) {
    homeKicks++;
    if (rng.chance(pHome)) home++;
    if (decided()) break;
    awayKicks++;
    if (rng.chance(pAway)) away++;
  }

  let guard = 0;
  while (home === away && guard++ < 30) {
    if (rng.chance(pHome)) home++;
    if (rng.chance(pAway)) away++;
  }
  if (home === away) home++; // salvaguarda: nunca devolver empate
  return { home, away };
}

/** Probabilidad de convertir un penal: tiradores vs arquero. */
export const penaltyProbability = (shooters: LivePlayer[], keeper?: LivePlayer): number => {
  const taking = [...shooters].filter((p) => p.position !== 'GK').sort((a, b) => b.skill - a.skill).slice(0, 5);
  const shooter = taking.length ? taking.reduce((s, p) => s + p.skill, 0) / taking.length : 70;
  return Math.min(0.9, Math.max(0.6, 0.76 + (shooter - (keeper?.skill ?? 80)) / 400));
};
