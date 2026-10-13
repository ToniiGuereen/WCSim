import { AwardItem, PodiumItem, StatsAwardsData, TopScorerItem } from '@/types';
import { Lang, StageCode, Tournament } from '../domain';
import { TEAMS, mustTeam, teamName } from '../data/catalog';
import { getSquad } from '../data/squads';

interface PlayerStat {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
  motm: number;
}

const STAGE_RANK: Record<StageCode, number> = {
  GROUPS: 0, ROUND_OF_32: 1, ROUND_OF_16: 2, QUARTER_FINALS: 3, SEMI_FINALS: 4, THIRD_PLACE: 4, FINAL: 6,
};

const T = {
  es: {
    champion: 'Campeón', runnerUp: 'Subcampeón', third: 'Tercer Puesto',
    ball: 'Balón de Oro', ballWhy: (g: number, a: number) => `Figura del torneo: ${g} goles y ${a} asistencias`,
    boot: 'Bota de Oro', bootWhy: (g: number) => `Máximo goleador con ${g} ${g === 1 ? 'gol' : 'goles'}`,
    glove: 'Guante de Oro', gloveWhy: (n: number) => `${n} ${n === 1 ? 'valla invicta' : 'vallas invictas'}`,
    young: 'Mejor Jugador Joven', youngWhy: (g: number, a: number) => `Revelación sub-21 con ${g} goles y ${a} asistencias`,
    fair: 'Premio Fair Play', fairWhy: 'Menor cantidad de infracciones y tarjetas',
  },
  en: {
    champion: 'Champion', runnerUp: 'Runner-up', third: 'Third Place',
    ball: 'Golden Ball', ballWhy: (g: number, a: number) => `Player of the tournament: ${g} goals and ${a} assists`,
    boot: 'Golden Boot', bootWhy: (g: number) => `Top scorer with ${g} ${g === 1 ? 'goal' : 'goals'}`,
    glove: 'Golden Glove', gloveWhy: (n: number) => `${n} ${n === 1 ? 'clean sheet' : 'clean sheets'}`,
    young: 'Best Young Player', youngWhy: (g: number, a: number) => `Under-21 breakout with ${g} goals and ${a} assists`,
    fair: 'Fair Play Award', fairWhy: 'Fewest fouls and cards',
  },
} as const;

export interface TournamentStats {
  players: Map<string, PlayerStat>;
  /** Vallas invictas por arquero titular de cada partido. */
  cleanSheets: Map<string, { id: string; name: string; teamId: string; count: number }>;
  teams: Map<string, { played: number; yellow: number; red: number }>;
  totalMatches: number;
  totalGoals: number;
  yellow: number;
  red: number;
}

const teamOfPlayer = (playerId: string): string => playerId.split('-')[0];

export function computeStats(t: Tournament): TournamentStats {
  const players = new Map<string, PlayerStat>();
  const cleanSheets: TournamentStats['cleanSheets'] = new Map();
  const teams: TournamentStats['teams'] = new Map();
  const player = (id: string, name: string, teamId: string) => {
    if (!players.has(id)) players.set(id, { id, name, teamId, goals: 0, assists: 0, motm: 0 });
    return players.get(id)!;
  };
  const team = (id: string) => {
    if (!teams.has(id)) teams.set(id, { played: 0, yellow: 0, red: 0 });
    return teams.get(id)!;
  };
  const keeper = (id: string, name: string, teamId: string) => {
    if (!cleanSheets.has(id)) cleanSheets.set(id, { id, name, teamId, count: 0 });
    return cleanSheets.get(id)!;
  };

  let totalGoals = 0;
  let yellow = 0;
  let red = 0;

  for (const m of t.matches) {
    team(m.homeId).played++;
    team(m.awayId).played++;
    const homeKeeper = keeper(m.homeGkId, m.homeGk, m.homeId);
    const awayKeeper = keeper(m.awayGkId, m.awayGk, m.awayId);
    if (m.awayScore === 0) homeKeeper.count++;
    if (m.homeScore === 0) awayKeeper.count++;

    totalGoals += m.goals.length;
    for (const g of m.goals) {
      player(g.scorerId, g.scorer, g.teamId).goals++;
      if (g.assistId && g.assist) player(g.assistId, g.assist, g.teamId).assists++;
    }
    for (const c of m.cards) {
      if (c.color === 'Y') { yellow++; team(c.teamId).yellow++; }
      else { red++; team(c.teamId).red++; }
    }
    if (m.motmId && m.motm) player(m.motmId, m.motm, teamOfPlayer(m.motmId)).motm++;
  }

  return { players, cleanSheets, teams, totalMatches: t.matches.length, totalGoals, yellow, red };
}

/** Qué tan lejos llegó un equipo (el campeón suma bonus). */
function reach(t: Tournament, teamId: string): number {
  let best = 0;
  for (const m of t.matches) if (m.homeId === teamId || m.awayId === teamId) best = Math.max(best, STAGE_RANK[m.stage]);
  return best + (t.championId === teamId ? 2 : 0);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function buildStatsAwards(t: Tournament, lang: Lang): StatsAwardsData {
  const stats = computeStats(t);
  const tr = T[lang];
  const nameOf = (teamId: string) => teamName(mustTeam(teamId), lang);

  const podium: PodiumItem[] = [];
  if (t.championId) {
    const entries: [number, string, string, string | undefined][] = [
      [1, tr.champion, '\u{1F947}', t.championId],
      [2, tr.runnerUp, '\u{1F948}', t.runnerUpId],
      [3, tr.third, '\u{1F949}', t.thirdId],
    ];
    for (const [place, placeLabel, medal, id] of entries) {
      if (!id) continue;
      const team = mustTeam(id);
      podium.push({ place, placeLabel, teamName: teamName(team, lang), medal, flag: team.flag });
    }
  }

  const all = [...stats.players.values()];
  const rankBy = (key: 'goals' | 'assists'): TopScorerItem[] => {
    const other = key === 'goals' ? 'assists' : 'goals';
    return all
      .filter((p) => p[key] > 0)
      .sort((a, b) => b[key] - a[key] || b[other] - a[other] || a.name.localeCompare(b.name))
      .slice(0, 5)
      .map((p, i) => ({ rank: i + 1, playerName: p.name, teamName: nameOf(p.teamId), value: p[key] }));
  };

  const awards: AwardItem[] = [];

  // Balón de Oro: aporte individual + recorrido del equipo
  const ballScore = (p: PlayerStat) => p.goals * 3 + p.assists * 2 + p.motm * 2.5 + reach(t, p.teamId) * 1.5;
  const ball = [...all].sort((a, b) => ballScore(b) - ballScore(a) || a.name.localeCompare(b.name))[0];
  if (ball) {
    awards.push({ icon: '\u{1F3C6}', title: tr.ball, winnerName: ball.name, teamName: nameOf(ball.teamId), reason: tr.ballWhy(ball.goals, ball.assists) });
  }

  // Bota de Oro
  const boot = [...all].sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name))[0];
  if (boot && boot.goals > 0) {
    awards.push({ icon: '\u{1F45F}', title: tr.boot, winnerName: boot.name, teamName: nameOf(boot.teamId), reason: tr.bootWhy(boot.goals) });
  }

  // Guante de Oro
  const glove = [...stats.cleanSheets.values()]
    .map((k) => ({ k, score: k.count * 2 + reach(t, k.teamId) * 1.5 }))
    .sort((a, b) => b.score - a.score || a.k.name.localeCompare(b.k.name))[0];
  if (glove) {
    awards.push({ icon: '\u{1F9E4}', title: tr.glove, winnerName: glove.k.name, teamName: nameOf(glove.k.teamId), reason: tr.gloveWhy(glove.k.count) });
  }

  // Mejor Jugador Joven (sub-21)
  const young = TEAMS.flatMap((tm) => getSquad(tm.id))
    .filter((p) => p.age <= 21 && stats.teams.has(teamOfPlayer(p.id)))
    .map((p) => {
      const s = stats.players.get(p.id);
      const goals = s?.goals ?? 0;
      const assists = s?.assists ?? 0;
      return { p, goals, assists, score: goals * 3 + assists * 2 + (s?.motm ?? 0) * 2.5 + reach(t, teamOfPlayer(p.id)) + p.skill / 100 };
    })
    .sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id))[0];
  if (young) {
    awards.push({ icon: '\u{1F31F}', title: tr.young, winnerName: young.p.name, teamName: nameOf(teamOfPlayer(young.p.id)), reason: tr.youngWhy(young.goals, young.assists) });
  }

  // Fair Play
  const fair = [...stats.teams.entries()]
    .filter(([, v]) => v.played >= 3)
    .map(([id, v]) => ({ id, rate: (v.yellow + v.red * 3) / v.played, played: v.played }))
    .sort((a, b) => a.rate - b.rate || b.played - a.played || a.id.localeCompare(b.id))[0];
  if (fair) {
    awards.push({ icon: '\u{1F54A}️', title: tr.fair, winnerName: nameOf(fair.id), teamName: nameOf(fair.id), reason: tr.fairWhy });
  }

  return {
    totalMatches: stats.totalMatches,
    totalGoals: stats.totalGoals,
    avgGoalsPerMatch: stats.totalMatches ? round2(stats.totalGoals / stats.totalMatches) : 0,
    totalYellowCards: stats.yellow,
    totalRedCards: stats.red,
    podium,
    topScorers: rankBy('goals'),
    topAssists: rankBy('assists'),
    awards,
  };
}
