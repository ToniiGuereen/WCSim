export interface WorldCupMetadataApiItem {
  worldCupId: string;
  edition: number;
  status: string;
  updatedAt: string;
}

export interface WorldCupPlayerStatApiItem {
  playerName: string;
  teamId: string;
  teamName: string;
  value: number;
}

export interface WorldCupPodiumTeamApiItem {
  teamId: string;
  teamName: string;
}

export interface WorldCupCardStatsApiItem {
  totalYellowCards: number;
  totalRedCards: number;
}

export interface WorldCupStatsApiItem {
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  champion: WorldCupPodiumTeamApiItem | null;
  runnerUp: WorldCupPodiumTeamApiItem | null;
  thirdPlace: WorldCupPodiumTeamApiItem | null;
  fourthPlace: WorldCupPodiumTeamApiItem | null;
  topScorers: WorldCupPlayerStatApiItem[];
  topAssists: WorldCupPlayerStatApiItem[];
  cards: WorldCupCardStatsApiItem;
}

export interface WorldCupAwardApiItem {
  code: string;
  winnerName: string;
  teamId: string;
  teamName: string;
  reason: string;
  goals: number;
  playerOfMatch: number;
  fairPlayPoints?: number | null;
  yellowCards?: number | null;
  redCards?: number | null;
}

export interface HistoricalPodiumTeamItem {
  teamId: string;
  teamName: string;
  flag: string;
  hasData: boolean;
}

export interface HistoricalPlayerHighlightItem {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  value: number;
  hasData: boolean;
}

export interface HistoricalFairPlayHighlightItem {
  teamId: string;
  teamName: string;
  teamFlag: string;
  fairPlayPoints: number;
  yellowCards: number;
  redCards: number;
  fairPlayRank: number;
  totalRankedTeams: number;
  hasData: boolean;
}

export interface HistoricalWorldCupItem {
  worldCupId: string;
  worldCupIdShort: string;
  finalPlayedAt: string | null;
  edition: number;
  editionLabel: string;
  status: string;
  statusLabel: string;
  champion: HistoricalPodiumTeamItem;
  runnerUp: HistoricalPodiumTeamItem;
  thirdPlace: HistoricalPodiumTeamItem;
  fourthPlace: HistoricalPodiumTeamItem;
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  yellowCards: number;
  redCards: number;
  finalScoreLabel: string;
  finalResolutionLabel: string;
  topScorer: HistoricalPlayerHighlightItem;
  topAssist: HistoricalPlayerHighlightItem;
  fairPlay: HistoricalFairPlayHighlightItem;
  worstFairPlay: HistoricalFairPlayHighlightItem;
}

export interface WorldCupHistoryScreenModel {
  lang: string;
  totalWorldCups: number;
  worldCups: HistoricalWorldCupItem[];
}
