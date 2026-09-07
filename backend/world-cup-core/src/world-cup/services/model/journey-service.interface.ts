// Respuesta cruda de la WorldCupAPI para Journey

export interface JourneyApiMatch {
  stage: string;
  matchCode: string;
  opponentTeamId: string;
  opponentTeamName: string;
  goalsFor: number | null;
  goalsAgainst: number | null;
  result: string;
  resolution: string;
  isPending: boolean;
}

export interface JourneyApiResponse {
  worldCupId: string;
  teamId: string;
  teamName: string;
  lang: string;
  worldCupStatus: string;
  stageReached: string;
  isChampion: boolean;
  isFinalPending: boolean;
  eliminatedByTeamId: string | null;
  eliminatedByTeamName: string | null;
  summary: string;
  matches: JourneyApiMatch[];
}
