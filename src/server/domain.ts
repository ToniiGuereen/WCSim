export type Lang = 'es' | 'en';
export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type StageCode =
  | 'GROUPS'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';
export type Resolution = 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES';

export interface TeamDef {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  confederation: string;
  /** Rating general 0-100: define la fuerza base de la selección en el simulador. */
  rating: number;
  strategy: string;
  formation: string;
  coach: string;
  coachNationality: string;
  coachAge: number;
}

export interface SquadPlayer {
  id: string;
  name: string;
  shirtNumber: number;
  position: Position;
  age: number;
  skill: number;
  attack: number;
  defense: number;
  energy: number;
  isCaptain: boolean;
}

export interface GoalEvent {
  minute: number;
  teamId: string;
  scorerId: string;
  scorer: string;
  assistId?: string;
  assist?: string;
  kind: 'goal' | 'penalty';
}

export interface CardEvent {
  minute: number;
  teamId: string;
  playerId: string;
  player: string;
  color: 'Y' | 'R';
}

export interface MatchRecord {
  number: number;
  stage: StageCode;
  group?: string;
  matchday?: number;
  homeId: string;
  awayId: string;
  /** Goles en juego (tiempo reglamentario + suplementario). La tanda de penales va aparte. */
  homeScore: number;
  awayScore: number;
  resolution: Resolution;
  penalties?: { home: number; away: number };
  /** null = empate (solo posible en fase de grupos). */
  winnerId: string | null;
  motmId?: string;
  motm?: string;
  goals: GoalEvent[];
  cards: CardEvent[];
  homeGkId: string;
  homeGk: string;
  awayGkId: string;
  awayGk: string;
}

export interface GroupDef {
  name: string;
  teamIds: string[];
}

export interface Tournament {
  seed: number;
  groups: GroupDef[];
  /** Sorteo de desempate fijo por torneo. */
  tiebreak: Record<string, number>;
  matches: MatchRecord[];
  simulated: boolean;
  finalists?: [string, string];
  championId?: string;
  runnerUpId?: string;
  thirdId?: string;
  fourthId?: string;
}
