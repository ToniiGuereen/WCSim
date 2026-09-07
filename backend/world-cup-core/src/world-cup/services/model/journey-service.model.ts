export class JourneyMatchModel {
  // Datos recibidos de la API que el frontend espera
  public stage: string;
  public matchCode: string;
  public opponentTeamId: string;
  public opponentTeamName: string;
  public goalsFor: number | null;
  public goalsAgainst: number | null;
  public result: string;
  public resolution: string;
  public isPending: boolean;

  // Datos que espera el frontend y que debe adaptar el backend
  public stageLabel: string;
  public opponentFlag: string;
  public scoreLabel: string;
  public resultLabel: string;
  public resultStyle: string;
  public resolutionLabel: string;

  constructor(data: {
    // Datos recibidos de la API
    stage: string;
    matchCode: string;
    opponentTeamId: string;
    opponentTeamName: string;
    goalsFor: number | null;
    goalsAgainst: number | null;
    result: string;
    resolution: string;
    isPending: boolean;

    // Datos que espera el frontend y que debe adaptar el backend
    stageLabel: string;
    opponentFlag: string;
    scoreLabel: string;
    resultLabel: string;
    resultStyle: string;
    resolutionLabel: string;
  }) {
    this.stage = data.stage;
    this.matchCode = data.matchCode;
    this.opponentTeamId = data.opponentTeamId;
    this.opponentTeamName = data.opponentTeamName;
    this.goalsFor = data.goalsFor;
    this.goalsAgainst = data.goalsAgainst;
    this.result = data.result;
    this.resolution = data.resolution;
    this.isPending = data.isPending;

    this.stageLabel = data.stageLabel;
    this.opponentFlag = data.opponentFlag;
    this.scoreLabel = data.scoreLabel;
    this.resultLabel = data.resultLabel;
    this.resultStyle = data.resultStyle;
    this.resolutionLabel = data.resolutionLabel;
  }
}

export class JourneyScreenModel {
  // Datos recibidos de la API que el frontend espera
  public worldCupId: string;
  public teamId: string;
  public teamName: string;
  public lang: string;
  public worldCupStatus: string;
  public stageReached: string;
  public isChampion: boolean;
  public isFinalPending: boolean;
  public eliminatedByTeamId: string | null;
  public eliminatedByTeamName: string | null;
  public summary: string;
  public matches: JourneyMatchModel[];

  // Datos que espera el frontend y que debe adaptar el backend
  public stageReachedLabel: string;
  public matchesPlayed: number;

  constructor(data: {
    // Datos recibidos de la API
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
    matches: JourneyMatchModel[];

    // Datos que espera el frontend y que debe adaptar el backend
    stageReachedLabel: string;
    matchesPlayed: number;
  }) {
    this.worldCupId = data.worldCupId;
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.lang = data.lang;
    this.worldCupStatus = data.worldCupStatus;
    this.stageReached = data.stageReached;
    this.isChampion = data.isChampion;
    this.isFinalPending = data.isFinalPending;
    this.eliminatedByTeamId = data.eliminatedByTeamId;
    this.eliminatedByTeamName = data.eliminatedByTeamName;
    this.summary = data.summary;
    this.matches = data.matches;

    this.stageReachedLabel = data.stageReachedLabel;
    this.matchesPlayed = data.matchesPlayed;
  }
}
