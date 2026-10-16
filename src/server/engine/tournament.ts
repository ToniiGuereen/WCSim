import { GroupDef, MatchRecord, StageCode, Tournament } from '../domain';
import { TEAMS, mustTeam } from '../data/catalog';
import { createRng } from '../rng';
import { TeamCtx, buildCtx, simulateMatch } from './matchSim';

export interface Standing {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  points: number;
}

export type ConfigOf = (teamId: string) => { strategy: string; formation: string };

const HOSTS = ['mex', 'can', 'usa'];
const GROUP_NAMES = 'ABCDEFGHIJKL'.split('');
/** Orden estándar de cuadro de 32: los mejores sembrados se cruzan lo más tarde posible. */
const BRACKET_ORDER = [1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21, 2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22];

/** Sorteo: 4 bombos por rating (anfitriones en el bombo 1), máx. 1 equipo por confederación (2 en UEFA). */
export function createDraw(seed: number): Tournament {
  const rng = createRng(seed);
  const byRating = [...TEAMS].sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id));
  const others = byRating.filter((t) => !HOSTS.includes(t.id));
  // Bombo 1 = 3 anfitriones + 9 mejores rankeados; los otros 3 bombos son de 12 (total 48).
  const rest = others.slice(9);
  const pots = [others.slice(0, 9), rest.slice(0, 12), rest.slice(12, 24), rest.slice(24, 36)];

  const groups: GroupDef[] = GROUP_NAMES.map((name) => ({ name, teamIds: [] }));
  const hostSlots = [0, 1, 3]; // A: México, B: Canadá, D: Estados Unidos
  groups[0].teamIds.push('mex');
  groups[1].teamIds.push('can');
  groups[3].teamIds.push('usa');

  const freeSlots = groups.map((_, i) => i).filter((i) => !hostSlots.includes(i));
  rng.shuffle(pots[0]).forEach((team, i) => groups[freeSlots[i]].teamIds.push(team.id));

  const allowed = (group: GroupDef, confederation: string) =>
    group.teamIds.filter((id) => mustTeam(id).confederation === confederation).length < (confederation === 'UEFA' ? 2 : 1);

  for (let p = 1; p <= 3; p++) {
    for (const team of rng.shuffle(pots[p])) {
      const needing = groups.filter((g) => g.teamIds.length === p);
      const candidates = needing.filter((g) => allowed(g, team.confederation));
      rng.pick(candidates.length ? candidates : needing).teamIds.push(team.id);
    }
  }

  const tiebreak: Record<string, number> = {};
  TEAMS.forEach((t) => (tiebreak[t.id] = rng.next()));
  return { seed, groups, tiebreak, matches: [], simulated: false };
}

const FIXTURES: [number, number][][] = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];

export function groupStandings(t: Tournament): Standing[][] {
  const hasResults = t.matches.some((m) => m.stage === 'GROUPS');
  return t.groups.map((group) => {
    const table = new Map<string, Standing>(
      group.teamIds.map((id) => [id, { teamId: id, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 }])
    );
    for (const m of t.matches.filter((x) => x.stage === 'GROUPS' && x.group === group.name)) {
      const h = table.get(m.homeId)!;
      const a = table.get(m.awayId)!;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { h.wins++; a.losses++; h.points += 3; }
      else if (m.homeScore < m.awayScore) { a.wins++; h.losses++; a.points += 3; }
      else { h.draws++; a.draws++; h.points++; a.points++; }
    }
    const rows = [...table.values()];
    return hasResults ? rows.sort((x, y) => compareStandings(t, x, y)) : rows;
  });
}

function compareStandings(t: Tournament, x: Standing, y: Standing): number {
  return y.points - x.points || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf || t.tiebreak[y.teamId] - t.tiebreak[x.teamId];
}

/** Simula grupos, eliminatorias y partido por el tercer puesto. La Final queda lista para jugarse. */
export function simulateTournament(t: Tournament, configOf: ConfigOf): void {
  const rng = createRng((t.seed ^ 0xa5a5a5a5) >>> 0);
  const cache = new Map<string, TeamCtx>();
  const ctx = (id: string): TeamCtx => {
    let c = cache.get(id);
    if (!c) {
      const cfg = configOf(id);
      c = buildCtx(id, cfg.formation, cfg.strategy);
      cache.set(id, c);
    }
    return c;
  };

  t.matches = [];
  t.finalists = undefined;
  t.championId = t.runnerUpId = t.thirdId = t.fourthId = undefined;
  let number = 0;

  const play = (home: string, away: string, stage: StageCode, extra: Partial<MatchRecord> = {}): MatchRecord => {
    const record = simulateMatch(rng, ctx(home), ctx(away), {
      number: ++number,
      stage,
      group: extra.group,
      matchday: extra.matchday,
      knockout: stage !== 'GROUPS',
    });
    t.matches.push(record);
    return record;
  };

  // Fase de grupos: 3 fechas
  for (let md = 1; md <= 3; md++) {
    for (const group of t.groups) {
      for (const [h, a] of FIXTURES[md - 1]) {
        play(group.teamIds[h], group.teamIds[a], 'GROUPS', { group: group.name, matchday: md });
      }
    }
  }

  // Clasificados: 12 primeros + 12 segundos + 8 mejores terceros
  const tables = groupStandings(t);
  const sorter = (x: Standing, y: Standing) => compareStandings(t, x, y);
  const winners = tables.map((tb) => tb[0]).sort(sorter);
  const seconds = tables.map((tb) => tb[1]).sort(sorter);
  const thirds = tables.map((tb) => tb[2]).sort(sorter).slice(0, 8);
  const seeds = [...winners, ...seconds, ...thirds].map((s) => s.teamId);

  const groupOf: Record<string, string> = {};
  t.groups.forEach((g) => g.teamIds.forEach((id) => (groupOf[id] = g.name)));

  let pairs: [string, string][] = [];
  for (let i = 0; i < 32; i += 2) pairs.push([seeds[BRACKET_ORDER[i] - 1], seeds[BRACKET_ORDER[i + 1] - 1]]);
  pairs = avoidGroupRematches(pairs, groupOf);

  const round = (matchups: [string, string][], stage: StageCode) => {
    const winnersOut: string[] = [];
    const losersOut: string[] = [];
    for (const [home, away] of matchups) {
      const m = play(home, away, stage);
      winnersOut.push(m.winnerId!);
      losersOut.push(m.winnerId === home ? away : home);
    }
    return { winners: winnersOut, losers: losersOut };
  };
  const nextPairs = (ids: string[]): [string, string][] => {
    const out: [string, string][] = [];
    for (let i = 0; i < ids.length; i += 2) out.push([ids[i], ids[i + 1]]);
    return out;
  };

  const r32 = round(pairs, 'ROUND_OF_32');
  const r16 = round(nextPairs(r32.winners), 'ROUND_OF_16');
  const qf = round(nextPairs(r16.winners), 'QUARTER_FINALS');
  const sf = round(nextPairs(qf.winners), 'SEMI_FINALS');

  const third = play(sf.losers[0], sf.losers[1], 'THIRD_PLACE');
  t.thirdId = third.winnerId!;
  t.fourthId = third.winnerId === third.homeId ? third.awayId : third.homeId;
  t.finalists = [sf.winners[0], sf.winners[1]];
  t.simulated = true;
}

function avoidGroupRematches(pairs: [string, string][], groupOf: Record<string, string>): [string, string][] {
  const out = pairs.map((p) => [...p] as [string, string]);
  const clash = (p: [string, string]) => groupOf[p[0]] === groupOf[p[1]];
  for (let pass = 0; pass < 40; pass++) {
    let changed = false;
    for (let i = 0; i < out.length; i++) {
      if (!clash(out[i])) continue;
      for (let k = 1; k < out.length; k++) {
        const j = (i + k) % out.length;
        if (groupOf[out[i][0]] !== groupOf[out[j][1]] && groupOf[out[j][0]] !== groupOf[out[i][1]]) {
          [out[i][1], out[j][1]] = [out[j][1], out[i][1]];
          changed = true;
          break;
        }
      }
    }
    if (!changed) break;
  }
  return out;
}

export function recordFinal(t: Tournament, record: MatchRecord): void {
  t.matches = t.matches.filter((m) => m.stage !== 'FINAL');
  t.matches.push(record);
  t.championId = record.winnerId!;
  t.runnerUpId = record.winnerId === record.homeId ? record.awayId : record.homeId;
}

export function clearFinal(t: Tournament): void {
  t.matches = t.matches.filter((m) => m.stage !== 'FINAL');
  t.championId = undefined;
  t.runnerUpId = undefined;
}

/**
 * Juega la Final de forma automática (el usuario no está en ella: la ve como espectador).
 * No hace nada si no hay finalistas o si la Final ya está registrada.
 */
export function autoPlayFinal(t: Tournament, configOf: ConfigOf): void {
  if (!t.simulated || !t.finalists || t.championId) return;
  const [home, away] = t.finalists;
  const rng = createRng((t.seed ^ 0x5f3759df) >>> 0);
  const c = (id: string) => {
    const cfg = configOf(id);
    return buildCtx(id, cfg.formation, cfg.strategy);
  };
  const number = Math.max(0, ...t.matches.map((m) => m.number)) + 1;
  recordFinal(t, simulateMatch(rng, c(home), c(away), { number, stage: 'FINAL', knockout: true }));
}
