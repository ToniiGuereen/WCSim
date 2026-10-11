export interface Team {
  teamId: string;
  id?: string;
  name: string;
  teamName?: string;
  flag: string;
  confederation?: string;
}

export interface Player {
  id: string;
  name: string;
  shirtNumber: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  skill: number;
  attack: number;
  defense: number;
  energy: number;
  isCaptain?: boolean;
  isOnField?: boolean;
}

export interface CoachMetric {
  label: string;
  value: number;
}

export interface CoachingData {
  coachName: string;
  coachNationality: string;
  coachAge: number;
  coachProfile: string;
  coachProfileDescription: string;
  currentStrategy: string;
  currentFormation: string;
  availableStrategies: { strategy: string; description: string }[];
  availableFormations: { formation: string; description: string }[];
  metrics: CoachMetric[];
}

export interface TitleChip {
  id?: string;
  title: string;
  year: number;
  host?: string;
}

export interface TeamHistorySection {
  title: string;
  icon: string;
  count: number;
  chips: string[];
}

export interface TeamHistoryData {
  teamId: string;
  teamName: string;
  totalTitles: number;
  sections: TeamHistorySection[];
}

export interface RivalItem {
  id: string;
  teamId: string;
  name: string;
  flag: string;
  confederation: string;
  overallRating: number;
  coachName: string;
  captainName: string;
  formation: string;
  strategyLabel: string;
}

export interface GroupTeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isMyTeam?: boolean;
}

export interface GroupData {
  groupName: string;
  teams: GroupTeamStanding[];
}

export interface JourneyMatch {
  stage: string;
  stageLabel: string;
  opponentTeamId: string;
  opponentTeamName: string;
  opponentFlag: string;
  scoreLabel: string;
  resultLabel: string;
  resultStyle: 'WIN' | 'LOSS' | 'DRAW';
  resolutionLabel: string;
}

export interface JourneyData {
  teamId: string;
  teamName: string;
  stageReachedLabel: string;
  matchesPlayed: number;
  summary: string;
  matches: JourneyMatch[];
}

export interface MatchDetailItem {
  matchId: string;
  matchCode: string;
  stage: string;
  groupName?: string;
  homeTeamId: string;
  homeTeamName: string;
  homeFlag: string;
  awayTeamId: string;
  awayTeamName: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  scoreLabel: string;
  resolutionLabel: string;
  penaltyLabel?: string;
  winnerTeamName?: string;
  winnerFlag?: string;
  playerOfMatchName?: string;
  goalsSummary?: string;
  cardsSummary?: string;
}

export interface FinalistTeam {
  teamId: string;
  name: string;
  flag: string;
  coach: string;
  formation: string;
  strategy: string;
}

export interface SimulationData {
  edition: number;
  status: 'READY_FOR_FINAL' | 'FINAL_ACTIVE' | 'ENDED' | 'PENDING';
  stadium: string;
  city: string;
  finalHomeTeam: FinalistTeam;
  finalAwayTeam: FinalistTeam;
}

export interface TopScorerItem {
  rank: number;
  playerName: string;
  teamName: string;
  value: number;
}

export interface AwardItem {
  icon: string;
  title: string;
  winnerName: string;
  teamName: string;
  reason: string;
}

export interface PodiumItem {
  place: number;
  placeLabel: string;
  teamName: string;
  medal: string;
  flag: string;
}

export interface StatsAwardsData {
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  totalYellowCards: number;
  totalRedCards: number;
  podium: PodiumItem[];
  topScorers: TopScorerItem[];
  topAssists: TopScorerItem[];
  awards: AwardItem[];
}

export interface HistoricalWorldCupItem {
  edition: number;
  year: number;
  host: string;
  worldCupIdShort: string;
  editionLabel: string;
  finalPlayedAt?: string;
  finalScoreLabel?: string;
  champion: { teamName: string; flag: string; hasData: boolean };
  runnerUp: { teamName: string; flag: string; hasData: boolean };
  thirdPlace: { teamName: string; flag: string; hasData: boolean };
  fourthPlace: { teamName: string; flag: string; hasData: boolean };
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  yellowCards: number;
  redCards: number;
}

export interface FinalChatMessage {
  minute: number;
  text: string;
  type?: 'narrative' | 'goal' | 'card' | 'tactical';
}

export interface FinalOption {
  index: number;
  label: string;
  actionCode?: string;
}

export interface FinalChatState {
  isFinished: boolean;
  result?: string;
  minute: number;
  turn: number;
  score: string;
  zone: string;
  possession: string;
  teamName: string;
  opponentName: string;
  messageItems: FinalChatMessage[];
  options: FinalOption[];
}

export interface LiveEventItem {
  minuto: number;
  tipo: string;
  descripcion: string;
  equipo?: string;
  jugador?: string;
}

export interface TacticalBreakdownLine {
  attack: number;
  defense: number;
  midfield: number;
}

export interface TeamStatePlayer {
  shirtNumber: number;
  name: string;
  position: string;
  energyLabel: string;
}

export interface TeamSideState {
  name: string;
  flag: string;
  formation: string;
  strategy: string;
  coachName: string;
  coachProfile: string;
  tacticalBreakdown: {
    effectiveTeamLine: TacticalBreakdownLine;
  };
  onField: TeamStatePlayer[];
  bench: TeamStatePlayer[];
  substitutionsUsed: number;
  maxSubstitutions: number;
}

export interface TeamStateData {
  minute: number;
  turn: number;
  score: string;
  team: TeamSideState;
  opponent: TeamSideState;
}
