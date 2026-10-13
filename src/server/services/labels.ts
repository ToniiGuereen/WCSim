import { Lang, MatchRecord, StageCode } from '../domain';
import { mustTeam, teamName } from '../data/catalog';

const L = {
  es: {
    win: 'Victoria', loss: 'Derrota', draw: 'Empate',
    regular: 'Tiempo Reglamentario', extra: 'Tiempo Suplementario', penalties: 'Definición por Penales',
    finished: 'Finalizado', extraShort: 'Tiempo Suplementario', pensShort: 'Penales',
    group: 'Grupo', matchday: 'Fecha', groupStage: 'Fase de Grupos',
    champion: 'Campeón', runnerUp: 'Finalista', third: 'Tercer Puesto', fourth: 'Cuarto Puesto',
    pending: 'Por definir', pen: 'pen',
  },
  en: {
    win: 'Win', loss: 'Loss', draw: 'Draw',
    regular: 'Regular Time', extra: 'Extra Time', penalties: 'Penalty Shootout',
    finished: 'Full Time', extraShort: 'Extra Time', pensShort: 'Penalties',
    group: 'Group', matchday: 'Matchday', groupStage: 'Group Stage',
    champion: 'Champion', runnerUp: 'Finalist', third: 'Third Place', fourth: 'Fourth Place',
    pending: 'To be decided', pen: 'pen',
  },
} as const;

const STAGES: Record<Lang, Record<StageCode, string>> = {
  es: {
    GROUPS: 'Fase de Grupos', ROUND_OF_32: '16avos de Final', ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final', SEMI_FINALS: 'Semifinales', THIRD_PLACE: 'Tercer Puesto', FINAL: 'Final',
  },
  en: {
    GROUPS: 'Group Stage', ROUND_OF_32: 'Round of 32', ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-finals', SEMI_FINALS: 'Semi-finals', THIRD_PLACE: 'Third Place', FINAL: 'Final',
  },
};

export type LabelKey = keyof (typeof L)['es'];
export const label = (lang: Lang, key: LabelKey): string => L[lang][key];
export const stageLabel = (lang: Lang, stage: StageCode): string => STAGES[lang][stage];

export const surname = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : fullName;
};

export const shortName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : fullName;
};

/** "2 - 2 (4-3 pen)" en el orden local-visitante del partido (o desde la perspectiva indicada). */
export function scoreLabel(m: MatchRecord, lang: Lang, perspective?: 'home' | 'away'): string {
  const [a, b] = perspective === 'away' ? [m.awayScore, m.homeScore] : [m.homeScore, m.awayScore];
  let text = `${a} - ${b}`;
  if (m.penalties) {
    const [pa, pb] = perspective === 'away' ? [m.penalties.away, m.penalties.home] : [m.penalties.home, m.penalties.away];
    text += ` (${pa}-${pb} ${label(lang, 'pen')})`;
  }
  return text;
}

export function goalsSummary(m: MatchRecord): string {
  const side = (teamId: string) => {
    const groups = new Map<string, { name: string; minutes: string[] }>();
    [...m.goals]
      .filter((g) => g.teamId === teamId)
      .sort((x, y) => x.minute - y.minute)
      .forEach((g) => {
        const entry = groups.get(g.scorerId) ?? { name: shortName(g.scorer), minutes: [] };
        entry.minutes.push(`${g.minute}'${g.kind === 'penalty' ? ' (p)' : ''}`);
        groups.set(g.scorerId, entry);
      });
    return [...groups.values()].map((e) => `${e.name} ${e.minutes.join(', ')}`).join(', ');
  };
  return [side(m.homeId), side(m.awayId)].filter(Boolean).join(' · ');
}

export function cardsSummary(m: MatchRecord, lang: Lang): string {
  const tag = (color: 'Y' | 'R') => (color === 'R' ? 'R' : lang === 'en' ? 'Y' : 'A');
  return [...m.cards]
    .sort((x, y) => x.minute - y.minute)
    .map((c) => `${surname(c.player)} (${tag(c.color)})`)
    .join(', ');
}

export function winnerName(m: MatchRecord, lang: Lang): { name: string; flag: string } | undefined {
  if (!m.winnerId) return undefined;
  const team = mustTeam(m.winnerId);
  return { name: teamName(team, lang), flag: team.flag };
}
