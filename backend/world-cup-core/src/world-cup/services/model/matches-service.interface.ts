export interface MatchPlayerMinuteApiItem {
  playerName: string;
  minute: number;
}

export interface MatchPlayerOfMatchApiItem {
  playerName: string;
  teamId: string;
  teamName: string;
}

export interface MatchApiItem {
  stage: string;
  groupName: string | null;
  matchCode: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  homePenaltyGoals: number | null;
  awayPenaltyGoals: number | null;
  winnerTeamId: string | null;
  winnerTeamName: string | null;
  resolution: string;
  isPending: boolean;
  playerOfMatch: MatchPlayerOfMatchApiItem | null;
  homeTeamTotalYellowCards: number;
  homeTeamTotalRedCards: number;
  awayTeamTotalYellowCards: number;
  awayTeamTotalRedCards: number;
  homeTeamGoalsDetails: MatchPlayerMinuteApiItem[];
  awayTeamGoalsDetails: MatchPlayerMinuteApiItem[];
}

export type MatchStageCode =
  | 'ALL'
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface MatchStageFilterItem {
  stage: MatchStageCode;
  label: string;
  count: number;
}

export interface MatchCardItem {
  stage: Exclude<MatchStageCode, 'ALL'>;
  stageLabel: string;
  groupName: string | null;
  matchCode: string;
  homeTeamId: string;
  homeTeamName: string;
  homeFlag: string;
  awayTeamId: string;
  awayTeamName: string;
  awayFlag: string;
  scoreLabel: string;
  penaltyLabel: string | null;
  resolution: string;
  resolutionLabel: string;
  isPending: boolean;
  winnerTeamId: string | null;
  winnerTeamName: string | null;
  winnerFlag: string | null;
  playerOfMatchName: string | null;
  playerOfMatchTeamId: string | null;
  playerOfMatchFlag: string | null;
  goalsSummary: string | null;
  cardsSummary: string | null;
}

export interface MatchesScreenResponse {
  teamId: string;
  lang: string;
  worldCupId?: string;
  selectedStage: MatchStageCode;
  availableStages: MatchStageFilterItem[];
  totalMatches: number;
  playedMatches: number;
  pendingMatches: number;
  matches: MatchCardItem[];
}
