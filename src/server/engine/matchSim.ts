import { CardEvent, GoalEvent, MatchRecord, Position, Resolution, StageCode } from '../domain';
import { Rng, clamp } from '../rng';
import { LivePlayer, Lines, Side, buildSide, penaltyProbability, runShootout, teamLines } from './lines';

export interface TeamCtx {
  id: string;
  side: Side;
  lines: Lines;
  gk: LivePlayer;
}

export function buildCtx(teamId: string, formation: string, strategy: string): TeamCtx {
  const side = buildSide(teamId, formation, strategy);
  return { id: teamId, side, lines: teamLines(side), gk: side.onField.find((p) => p.position === 'GK') ?? side.onField[0] };
}

const SCORER_WEIGHT: Record<Position, number> = { FW: 3.2, MF: 1.4, DF: 0.45, GK: 0 };
const ASSIST_WEIGHT: Record<Position, number> = { MF: 2, FW: 1.6, DF: 0.7, GK: 0 };
const CARD_WEIGHT: Record<Position, number> = { DF: 1.3, MF: 1.2, FW: 0.8, GK: 0.05 };

export const pickScorer = (rng: Rng, players: LivePlayer[]): LivePlayer =>
  rng.weighted(players, (p) => SCORER_WEIGHT[p.position] * Math.pow(p.attack / 100, 3));

export const pickAssist = (rng: Rng, players: LivePlayer[], scorer: LivePlayer): LivePlayer | undefined => {
  const pool = players.filter((p) => p.id !== scorer.id && p.position !== 'GK');
  return pool.length ? rng.weighted(pool, (p) => ASSIST_WEIGHT[p.position] * Math.pow(p.attack / 100, 2)) : undefined;
};

export const pickCardPlayer = (rng: Rng, players: LivePlayer[]): LivePlayer | undefined =>
  players.length ? rng.weighted(players, (p) => CARD_WEIGHT[p.position]) : undefined;

export interface MatchMeta {
  number: number;
  stage: StageCode;
  group?: string;
  matchday?: number;
  knockout: boolean;
}

/** Goles esperados: ataque propio contra la defensa (y arquero) rival. */
const lambdaFor = (att: TeamCtx, def: TeamCtx): number =>
  clamp(1.0 * Math.exp((att.lines.attack - (0.78 * def.lines.defense + 0.22 * def.lines.gk)) / 30), 0.12, 3.6);

function makeGoals(rng: Rng, team: TeamCtx, count: number, minMinute: number, maxMinute: number): GoalEvent[] {
  const goals: GoalEvent[] = [];
  for (let i = 0; i < count; i++) {
    const penalty = rng.chance(0.09);
    const scorer = pickScorer(rng, team.side.onField);
    const assist = !penalty && rng.chance(0.7) ? pickAssist(rng, team.side.onField, scorer) : undefined;
    goals.push({
      minute: rng.int(minMinute, maxMinute),
      teamId: team.id,
      scorerId: scorer.id,
      scorer: scorer.name,
      assistId: assist?.id,
      assist: assist?.name,
      kind: penalty ? 'penalty' : 'goal',
    });
  }
  return goals;
}

function makeCards(rng: Rng, team: TeamCtx, knockout: boolean, maxMinute: number): CardEvent[] {
  const cards: CardEvent[] = [];
  const pool = team.side.onField.filter((p) => p.position !== 'GK');
  const yellows = Math.min(5, rng.poisson(knockout ? 1.9 : 1.5));
  for (let i = 0; i < yellows && pool.length; i++) {
    const player = pickCardPlayer(rng, pool);
    if (!player) break;
    pool.splice(pool.indexOf(player), 1);
    cards.push({ minute: rng.int(5, maxMinute), teamId: team.id, playerId: player.id, player: player.name, color: 'Y' });
  }
  if (pool.length && rng.chance(0.035)) {
    const player = pickCardPlayer(rng, pool);
    if (player) cards.push({ minute: rng.int(20, maxMinute), teamId: team.id, playerId: player.id, player: player.name, color: 'R' });
  }
  return cards;
}

function chooseMotm(rng: Rng, m: MatchRecord, home: TeamCtx, away: TeamCtx): LivePlayer {
  const contrib = new Map<string, number>();
  for (const g of m.goals) {
    contrib.set(g.scorerId, (contrib.get(g.scorerId) ?? 0) + 3);
    if (g.assistId) contrib.set(g.assistId, (contrib.get(g.assistId) ?? 0) + 2);
  }
  const winner = m.winnerId === home.id ? home : m.winnerId === away.id ? away : null;
  const pool = winner ? winner.side.onField : [...home.side.onField, ...away.side.onField];
  const best = pool
    .filter((p) => contrib.has(p.id))
    .sort((a, b) => (contrib.get(b.id) ?? 0) - (contrib.get(a.id) ?? 0) || b.skill - a.skill)[0];
  if (best) return best;

  const cleanSheet = !!winner && (winner.id === home.id ? m.awayScore === 0 : m.homeScore === 0);
  return rng.weighted(pool, (p) => p.skill * (cleanSheet && p.position === 'GK' ? 2.5 : cleanSheet && p.position === 'DF' ? 1.5 : 1));
}

/** Simula un partido completo (grupos o eliminatoria con suplementario y penales). */
export function simulateMatch(rng: Rng, home: TeamCtx, away: TeamCtx, meta: MatchMeta): MatchRecord {
  const goals = [
    ...makeGoals(rng, home, rng.poisson(lambdaFor(home, away)), 1, 90),
    ...makeGoals(rng, away, rng.poisson(lambdaFor(away, home)), 1, 90),
  ];
  let homeScore = goals.filter((g) => g.teamId === home.id).length;
  let awayScore = goals.length - homeScore;
  let resolution: Resolution = 'REGULAR';
  let penalties: MatchRecord['penalties'];
  let maxCardMinute = 90;

  if (meta.knockout && homeScore === awayScore) {
    maxCardMinute = 120;
    const extra = [
      ...makeGoals(rng, home, rng.poisson(lambdaFor(home, away) * 0.36), 91, 120),
      ...makeGoals(rng, away, rng.poisson(lambdaFor(away, home) * 0.36), 91, 120),
    ];
    goals.push(...extra);
    const extraHome = extra.filter((g) => g.teamId === home.id).length;
    homeScore += extraHome;
    awayScore += extra.length - extraHome;
    resolution = 'EXTRA_TIME';

    if (homeScore === awayScore) {
      resolution = 'PENALTIES';
      penalties = runShootout(
        rng,
        penaltyProbability(home.side.onField, away.gk),
        penaltyProbability(away.side.onField, home.gk)
      );
    }
  }

  const winnerId = penalties
    ? penalties.home > penalties.away ? home.id : away.id
    : homeScore === awayScore ? null : homeScore > awayScore ? home.id : away.id;

  const record: MatchRecord = {
    number: meta.number,
    stage: meta.stage,
    group: meta.group,
    matchday: meta.matchday,
    homeId: home.id,
    awayId: away.id,
    homeScore,
    awayScore,
    resolution,
    penalties,
    winnerId,
    goals: goals.sort((a, b) => a.minute - b.minute),
    cards: [...makeCards(rng, home, meta.knockout, maxCardMinute), ...makeCards(rng, away, meta.knockout, maxCardMinute)].sort((a, b) => a.minute - b.minute),
    homeGkId: home.gk.id,
    homeGk: home.gk.name,
    awayGkId: away.gk.id,
    awayGk: away.gk.name,
  };

  const motm = chooseMotm(rng, record, home, away);
  record.motmId = motm.id;
  record.motm = motm.name;
  return record;
}
