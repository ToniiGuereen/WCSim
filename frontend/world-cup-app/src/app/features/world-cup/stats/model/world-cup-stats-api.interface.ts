export interface StatsPodiumItem {
  place: string;
  placeLabel: string;
  medal: string;
  teamId: string;
  teamName: string;
}

export interface StatsLeaderboardItem {
  rank: number;
  playerName: string;
  teamId: string;
  teamName: string;
  value: number;
}

export interface StatsAwardItem {
  code: string;
  title: string;
  icon: string;
  winnerName: string;
  teamId: string;
  teamName: string;
  reason: string;
}

export interface WorldCupStatsApiResponse {
  worldCupEnded: boolean;
  worldCupId: string | null;
  teamId: string;
  lang: 'es' | 'en';
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  totalYellowCards: number;
  totalRedCards: number;
  podium: StatsPodiumItem[];
  topScorers: StatsLeaderboardItem[];
  topAssists: StatsLeaderboardItem[];
  awards: StatsAwardItem[];
}
