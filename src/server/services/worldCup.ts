import { GroupData, HistoricalWorldCupItem, JourneyData, JourneyMatch, MatchDetailItem, SimulationData, StatsAwardsData, FinalistTeam } from '@/types';
import { CONFIG } from '../config';
import { Lang, MatchRecord, StageCode, Tournament } from '../domain';
import { TEAMS, findTeam, mustTeam, teamName } from '../data/catalog';
import { PAST_EDITIONS } from '../data/history';
import { autoPlayFinal, createDraw, groupStandings, simulateTournament } from '../engine/tournament';
import { buildStatsAwards, computeStats } from '../engine/stats';
import { store, teamConfig, tournamentStatus } from '../engine/state';
import { randomSeed } from '../rng';
import { cardsSummary, goalsSummary, label, scoreLabel, stageLabel } from './labels';

// ───────────────────────── grupos ─────────────────────────

export function getGroups(lang: Lang): GroupData[] {
  const { tournament: t, myTeamId } = store();
  const tables = groupStandings(t);
  return t.groups.map((group, i) => ({
    groupName: group.name,
    teams: tables[i].map((row) => ({
      teamId: row.teamId,
      teamName: teamName(mustTeam(row.teamId), lang),
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.gf,
      goalsAgainst: row.ga,
      goalDifference: row.gf - row.ga,
      points: row.points,
      isMyTeam: row.teamId === myTeamId,
    })),
  }));
}

// ───────────────────────── recorrido de un equipo ─────────────────────────

const resolutionOf = (m: MatchRecord, lang: Lang) =>
  label(lang, m.resolution === 'PENALTIES' ? 'penalties' : m.resolution === 'EXTRA_TIME' ? 'extra' : 'regular');

function reachedLabel(t: Tournament, teamId: string, lang: Lang): string {
  const es = lang === 'es';
  if (!t.simulated) return label(lang, 'pending');
  if (t.championId === teamId) return label(lang, 'champion');
  if (t.runnerUpId === teamId) return label(lang, 'runnerUp');
  if (t.finalists?.includes(teamId)) return label(lang, 'runnerUp'); // finalista con la final aún sin jugar
  if (t.thirdId === teamId) return label(lang, 'third');
  if (t.fourthId === teamId) return label(lang, 'fourth');

  const last = [...t.matches].reverse().find((m) => m.homeId === teamId || m.awayId === teamId);
  const stage = last?.stage ?? 'GROUPS';
  const names: Record<StageCode, [string, string]> = {
    GROUPS: ['Eliminado en Fase de Grupos', 'Eliminated in the Group Stage'],
    ROUND_OF_32: ['Eliminado en 16avos de Final', 'Eliminated in the Round of 32'],
    ROUND_OF_16: ['Eliminado en Octavos de Final', 'Eliminated in the Round of 16'],
    QUARTER_FINALS: ['Eliminado en Cuartos de Final', 'Eliminated in the Quarter-finals'],
    SEMI_FINALS: ['Eliminado en Semifinales', 'Eliminated in the Semi-finals'],
    THIRD_PLACE: ['Eliminado en Semifinales', 'Eliminated in the Semi-finals'],
    FINAL: ['Finalista', 'Finalist'],
  };
  return names[stage][es ? 0 : 1];
}

export function getJourney(teamId: string, lang: Lang): JourneyData {
  const t = store().tournament;
  const team = mustTeam(teamId);
  const mine = t.matches.filter((m) => m.homeId === teamId || m.awayId === teamId).sort((a, b) => a.number - b.number);

  const matches: JourneyMatch[] = mine.map((m) => {
    const isHome = m.homeId === teamId;
    const opponent = mustTeam(isHome ? m.awayId : m.homeId);
    const style: JourneyMatch['resultStyle'] = m.winnerId === null ? 'DRAW' : m.winnerId === teamId ? 'WIN' : 'LOSS';
    const stageText =
      m.stage === 'GROUPS' ? `${stageLabel(lang, 'GROUPS')} · ${label(lang, 'matchday')} ${m.matchday}` : stageLabel(lang, m.stage);
    return {
      stage: m.stage === 'GROUPS' ? `GROUPS_${m.matchday}` : m.stage,
      stageLabel: stageText,
      opponentTeamId: opponent.id,
      opponentTeamName: teamName(opponent, lang),
      opponentFlag: opponent.flag,
      scoreLabel: scoreLabel(m, lang, isHome ? 'home' : 'away'),
      resultLabel: label(lang, style === 'WIN' ? 'win' : style === 'LOSS' ? 'loss' : 'draw'),
      resultStyle: style,
      resolutionLabel: resolutionOf(m, lang),
    };
  });

  const wins = matches.filter((m) => m.resultStyle === 'WIN').length;
  const draws = matches.filter((m) => m.resultStyle === 'DRAW').length;
  const losses = matches.filter((m) => m.resultStyle === 'LOSS').length;
  let gf = 0;
  let ga = 0;
  mine.forEach((m) => {
    const home = m.homeId === teamId;
    gf += home ? m.homeScore : m.awayScore;
    ga += home ? m.awayScore : m.homeScore;
  });

  const summary = !t.simulated
    ? lang === 'en'
      ? 'The World Cup has not been simulated yet. Run the simulation to see this team’s path.'
      : 'Todavía no se simuló el Mundial. Ejecutá la simulación para ver el camino de este equipo.'
    : lang === 'en'
      ? `${wins} wins, ${draws} draws and ${losses} losses over ${matches.length} matches. Goals: ${gf} for, ${ga} against.`
      : `${wins} victorias, ${draws} empates y ${losses} derrotas en ${matches.length} partidos. Goles: ${gf} a favor y ${ga} en contra.`;

  return {
    teamId,
    teamName: teamName(team, lang),
    stageReachedLabel: reachedLabel(t, teamId, lang),
    matchesPlayed: matches.length,
    summary,
    matches,
  };
}

// ───────────────────────── partidos ─────────────────────────

export function getMatches(stage: StageCode | undefined, lang: Lang): MatchDetailItem[] {
  const t = store().tournament;
  return t.matches
    .filter((m) => !stage || m.stage === stage)
    .sort((a, b) => a.number - b.number)
    .map((m) => {
      const home = mustTeam(m.homeId);
      const away = mustTeam(m.awayId);
      const winner = m.winnerId ? mustTeam(m.winnerId) : undefined;
      return {
        matchId: `m${m.number}`,
        matchCode: m.stage === 'FINAL' ? 'M-FINAL' : `M-${String(m.number).padStart(3, '0')}`,
        stage: m.stage,
        groupName: m.group ? `${label(lang, 'group')} ${m.group}` : undefined,
        homeTeamId: home.id,
        homeTeamName: teamName(home, lang),
        homeFlag: home.flag,
        awayTeamId: away.id,
        awayTeamName: teamName(away, lang),
        awayFlag: away.flag,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        scoreLabel: scoreLabel(m, lang),
        resolutionLabel: label(lang, m.resolution === 'PENALTIES' ? 'pensShort' : m.resolution === 'EXTRA_TIME' ? 'extraShort' : 'finished'),
        penaltyLabel: m.penalties && winner
          ? lang === 'en'
            ? `Penalties: ${m.penalties.home} - ${m.penalties.away} (${teamName(winner, lang)} win)`
            : `Penales: ${m.penalties.home} - ${m.penalties.away} a favor de ${teamName(winner, lang)}`
          : undefined,
        winnerTeamName: winner ? teamName(winner, lang) : undefined,
        winnerFlag: winner?.flag,
        playerOfMatchName: m.motm,
        goalsSummary: goalsSummary(m) || undefined,
        cardsSummary: cardsSummary(m, lang) || undefined,
      };
    });
}

// ───────────────────────── estadísticas e historial ─────────────────────────

export const getStatsAwards = (lang: Lang): StatsAwardsData => buildStatsAwards(store().tournament, lang);

const HOST_EN: Record<string, string> = { Catar: 'Qatar', Rusia: 'Russia' };

function localizeEdition(item: HistoricalWorldCupItem, lang: Lang): HistoricalWorldCupItem {
  if (lang === 'es') return item;
  const place = (p: HistoricalWorldCupItem['champion']) => {
    const team = TEAMS.find((x) => x.name === p.teamName);
    return { ...p, teamName: team ? team.nameEn : p.teamName };
  };
  return {
    ...item,
    host: HOST_EN[item.host] ?? item.host,
    editionLabel: `FIFA World Cup ${item.year}`,
    champion: place(item.champion),
    runnerUp: place(item.runnerUp),
    thirdPlace: place(item.thirdPlace),
    fourthPlace: place(item.fourthPlace),
  };
}

export function getHistory(lang: Lang): HistoricalWorldCupItem[] {
  const t = store().tournament;
  const items: HistoricalWorldCupItem[] = [];

  if (t.championId && t.runnerUpId && t.thirdId && t.fourthId) {
    const stats = computeStats(t);
    const final = t.matches.find((m) => m.stage === 'FINAL');
    const entry = (id: string) => {
      const team = mustTeam(id);
      return { teamName: teamName(team, lang), flag: team.flag, hasData: true };
    };
    items.push({
      edition: 23,
      year: CONFIG.edition,
      host: lang === 'en' ? 'USA, Canada and Mexico' : 'USA, Canadá y México',
      worldCupIdShort: `WC${CONFIG.edition}`,
      editionLabel: lang === 'en' ? `FIFA World Cup ${CONFIG.edition}` : `Mundial FIFA ${CONFIG.edition}`,
      finalPlayedAt: CONFIG.finalDate,
      finalScoreLabel: final ? scoreLabel(final, lang) : undefined,
      champion: entry(t.championId),
      runnerUp: entry(t.runnerUpId),
      thirdPlace: entry(t.thirdId),
      fourthPlace: entry(t.fourthId),
      totalMatches: stats.totalMatches,
      totalGoals: stats.totalGoals,
      avgGoalsPerMatch: stats.totalMatches ? Math.round((stats.totalGoals / stats.totalMatches) * 100) / 100 : 0,
      yellowCards: stats.yellow,
      redCards: stats.red,
    });
  }
  return [...items, ...PAST_EDITIONS.map((e) => localizeEdition(e, lang))];
}

// ───────────────────────── simulación ─────────────────────────

/** Local = equipo del usuario si llegó a la final; si no, el primer finalista. */
export function finalPairing(): { userId: string; oppId: string } | null {
  const { tournament: t, myTeamId } = store();
  if (!t.simulated || !t.finalists) return null;
  const [a, b] = t.finalists;
  if (b === myTeamId) return { userId: b, oppId: a };
  return { userId: a, oppId: b };
}

/** ¿La selección del usuario juega la Gran Final? Solo entonces puede jugarla por turnos. */
export function userInFinal(): boolean {
  const { tournament: t, myTeamId } = store();
  return !!t.simulated && !!t.finalists?.includes(myTeamId);
}

type Outcome = NonNullable<SimulationData['userOutcome']>;

/** Fase en la que terminó la campaña del usuario. */
export function userCampaign(lang: Lang): { outcome: Outcome; stage?: StageCode; stageLabel?: string } {
  const { tournament: t, myTeamId } = store();
  if (!t.simulated) return { outcome: 'PENDING' };
  if (t.championId === myTeamId) return { outcome: 'CHAMPION' };
  if (t.runnerUpId === myTeamId) return { outcome: 'RUNNER_UP' };
  if (t.finalists?.includes(myTeamId)) return { outcome: 'IN_FINAL' };
  if (t.thirdId === myTeamId) return { outcome: 'THIRD' };
  if (t.fourthId === myTeamId) return { outcome: 'FOURTH' };
  const last = [...t.matches].reverse().find((m) => m.homeId === myTeamId || m.awayId === myTeamId);
  // Un perdedor de semifinal juega el tercer puesto: si llegó acá y no figura 3º/4º, cayó antes.
  const stage = last?.stage === 'THIRD_PLACE' ? 'SEMI_FINALS' : last?.stage ?? 'GROUPS';
  return { outcome: 'ELIMINATED', stage, stageLabel: stageLabel(lang, stage) };
}

function finalist(teamId: string, lang: Lang): FinalistTeam {
  const team = mustTeam(teamId);
  const cfg = teamConfig(teamId);
  return { teamId, name: teamName(team, lang), flag: team.flag, coach: team.coach, formation: cfg.formation, strategy: cfg.strategy };
}

const TBD = (lang: Lang): FinalistTeam => ({
  teamId: '',
  name: label(lang, 'pending'),
  flag: '\u{2753}',
  coach: '—',
  formation: '—',
  strategy: '—',
});

function campaignMessage(lang: Lang): string {
  const es = lang === 'es';
  const { tournament: t, myTeamId } = store();
  const me = teamName(mustTeam(myTeamId), lang);
  const { outcome, stageLabel: stg } = userCampaign(lang);
  const champ = t.championId ? teamName(mustTeam(t.championId), lang) : '';
  switch (outcome) {
    case 'PENDING':
      return es ? `Simulá el Mundial para empezar la campaña de ${me}.` : `Simulate the World Cup to start ${me}'s campaign.`;
    case 'IN_FINAL':
      return es ? `¡${me} llegó a la Gran Final! Ahora la jugás vos.` : `${me} reached the Grand Final! Now you play it.`;
    case 'CHAMPION':
      return es ? `¡${me} es CAMPEÓN DEL MUNDO!` : `${me} are WORLD CHAMPIONS!`;
    case 'RUNNER_UP':
      return es ? `${me} perdió la Gran Final. Campeón: ${champ}.` : `${me} lost the Grand Final. Champion: ${champ}.`;
    case 'THIRD':
      return es ? `${me} quedó eliminado en semifinales y ganó el tercer puesto. La final la jugaron otros: campeón ${champ}.` : `${me} went out in the semi-finals and won third place. Champion: ${champ}.`;
    case 'FOURTH':
      return es ? `${me} quedó cuarto. La final la jugaron otros: campeón ${champ}.` : `${me} finished fourth. Champion: ${champ}.`;
    default:
      return es
        ? `${me} quedó eliminado en: ${stg}. No podés jugar la Gran Final porque tu selección no llegó; la final se simuló sola (campeón: ${champ}).`
        : `${me} were eliminated in: ${stg}. You can't play the Grand Final because your team didn't reach it; it was auto-simulated (champion: ${champ}).`;
  }
}

export function getSimulation(lang: Lang): SimulationData {
  const pairing = finalPairing();
  const status = tournamentStatus();
  const { tournament: t, myTeamId } = store();
  const camp = userCampaign(lang);
  return {
    edition: CONFIG.edition,
    status,
    stadium: CONFIG.stadium,
    city: CONFIG.city,
    finalHomeTeam: pairing ? finalist(pairing.userId, lang) : finalist(myTeamId, lang),
    finalAwayTeam: pairing ? finalist(pairing.oppId, lang) : TBD(lang),
    myTeamId,
    userInFinal: userInFinal(),
    userOutcome: camp.outcome,
    userEliminatedStage: camp.stageLabel,
    message: campaignMessage(lang),
    champion: t.championId ? finalist(t.championId, lang) : undefined,
  };
}

/**
 * Simula el torneo. Si ya estaba simulado, sortea un torneo nuevo (salvo que WC_SEED lo fije).
 * Si la selección del usuario no llega a la Final, la Final se juega sola.
 */
export function runSimulation(lang: Lang): SimulationData {
  const s = store();
  if (s.tournament.simulated) s.tournament = createDraw(CONFIG.fixedSeed ?? randomSeed());
  s.finalSession = undefined;
  simulateTournament(s.tournament, (id) => teamConfig(id));
  if (!userInFinal()) autoPlayFinal(s.tournament, (id) => teamConfig(id));
  return getSimulation(lang);
}

export const teamExists = (id: string) => !!findTeam(id);
