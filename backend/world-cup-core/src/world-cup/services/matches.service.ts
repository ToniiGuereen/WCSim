import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import {
  normalizeNonNegativeNumber,
  normalizeNullableNumber,
} from '../../basic/helpers/normalize.helper';
import { LanguageEnum } from '../../basic/model/language.enum';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';
import {
  MatchApiItem,
  MatchCardItem,
  MatchStageCode,
  MatchStageFilterItem,
  MatchesScreenResponse,
} from './model/matches-service.interface';
import { CurrentWorldCupApiResponse } from './model/simulation-service.interface';

const MATCHES_UNAVAILABLE_MESSAGE =
  'Match data is not available yet. Run the simulation first.';

const MATCHES_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_MATCHES_UNAVAILABLE,
    message: MATCHES_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_MATCHES_UNAVAILABLE,
    message: MATCHES_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
};

const MATCHES_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_MATCHES_FETCH_FAILED,
  message: 'Unable to load match data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

const STAGE_LABELS: Record<MatchStageCode, string> = {
  ALL: 'Todos',
  GROUP_STAGE: 'Fase de Grupos',
  ROUND_OF_32: 'Dieciseisavos',
  ROUND_OF_16: 'Octavos',
  QUARTER_FINALS: 'Cuartos',
  SEMI_FINALS: 'Semifinales',
  THIRD_PLACE: 'Tercer Puesto',
  FINAL: 'Final',
};

const PLAYABLE_STAGES: Array<Exclude<MatchStageCode, 'ALL'>> = [
  'GROUP_STAGE',
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

const RESOLUTION_LABELS: Record<string, string> = {
  REGULAR_TIME: 'Tiempo regular',
  EXTRA_TIME: 'Prórroga',
  PENALTIES: 'Penales',
};

@Injectable()
export class MatchesService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getMatches(lang?: string, stage?: string): Promise<MatchesScreenResponse> {
    const resolvedLang = this.resolveLang(lang);
    const selectedStage = this.normalizeStage(stage);

    try {
      const currentWorldCup: CurrentWorldCupApiResponse =
        await this.worldCupFeatureApiService.getCurrentWorldCup(resolvedLang);

      if (!this.hasActiveSimulation(currentWorldCup)) {
        throw this.createMatchesUnavailableException();
      }

      const allMatches: MatchApiItem[] = await this.worldCupFeatureApiService.getCurrentMatches(
        undefined,
        resolvedLang,
      );

      return this.buildMatchesScreen(allMatches, selectedStage, resolvedLang);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorUtils.mapWorldCupApiError(
        error,
        MATCHES_API_ERROR_STATUS_MAP,
        MATCHES_API_ERROR_FALLBACK,
      );
    }
  }

  private buildMatchesScreen(
    allMatches: MatchApiItem[],
    selectedStage: MatchStageCode,
    lang: LanguageEnum,
  ): MatchesScreenResponse {
    const matches = Array.isArray(allMatches) ? allMatches : [];
    const visibleMatches = matches.filter((match) => this.matchesStage(match, selectedStage));

    return {
      teamId: this.getCurrentTeamId(),
      lang,
      selectedStage,
      availableStages: this.buildStageFilters(matches),
      totalMatches: matches.length,
      playedMatches: matches.filter((match) => !match.isPending).length,
      pendingMatches: matches.filter((match) => match.isPending).length,
      matches: visibleMatches.map((match) => this.mapMatchCard(match)),
    };
  }

  private buildStageFilters(matches: MatchApiItem[]): MatchStageFilterItem[] {
    const playableFilters = PLAYABLE_STAGES.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage],
      count: matches.filter((match) => this.normalizeStage(match.stage) === stage).length,
    }));

    return [
      { stage: 'ALL', label: STAGE_LABELS.ALL, count: matches.length },
      ...playableFilters,
    ];
  }

  private mapMatchCard(match: MatchApiItem): MatchCardItem {
    const stage = this.normalizeStage(match.stage) as Exclude<MatchStageCode, 'ALL'>;

    return {
      stage,
      stageLabel: STAGE_LABELS[stage] ?? match.stage,
      groupName: match.groupName ?? null,
      matchCode: match.matchCode,
      homeTeamId: match.homeTeamId,
      homeTeamName: match.homeTeamName,
      homeFlag: '',
      awayTeamId: match.awayTeamId,
      awayTeamName: match.awayTeamName,
      awayFlag: '',
      scoreLabel: this.buildScoreLabel(match),
      penaltyLabel: this.buildPenaltyLabel(match),
      resolution: match.resolution,
      resolutionLabel: this.buildResolutionLabel(match),
      isPending: Boolean(match.isPending),
      winnerTeamId: match.winnerTeamId ?? null,
      winnerTeamName: match.winnerTeamName ?? null,
      winnerFlag: null,
      playerOfMatchName: match.playerOfMatch?.playerName ?? null,
      playerOfMatchTeamId: match.playerOfMatch?.teamId ?? null,
      playerOfMatchFlag: null,
      goalsSummary: this.buildGoalsSummary(match),
      cardsSummary: this.buildCardsSummary(match),
    };
  }

  private buildScoreLabel(match: MatchApiItem): string {
    if (match.isPending) {
      return 'Pendiente';
    }
    return `${normalizeNonNegativeNumber(match.homeGoals)} - ${normalizeNonNegativeNumber(match.awayGoals)}`;
  }

  private buildPenaltyLabel(match: MatchApiItem): string | null {
    const homePenalties = normalizeNullableNumber(match.homePenaltyGoals);
    const awayPenalties = normalizeNullableNumber(match.awayPenaltyGoals);

    if (homePenalties === null || awayPenalties === null) {
      return null;
    }
    return `Penales ${homePenalties}-${awayPenalties}`;
  }

  private buildResolutionLabel(match: MatchApiItem): string {
    if (match.isPending) {
      return 'Pendiente';
    }
    const resolution = (match.resolution ?? '').trim().toUpperCase();
    return RESOLUTION_LABELS[resolution] ?? 'Pendiente';
  }

  private buildGoalsSummary(match: MatchApiItem): string | null {
    if (match.isPending) {
      return null;
    }

    const homeGoals = this.formatScorers(match.homeTeamGoalsDetails);
    const awayGoals = this.formatScorers(match.awayTeamGoalsDetails);

    if (!homeGoals && !awayGoals) {
      return null;
    }
    return `${homeGoals} / ${awayGoals}`;
  }

  private formatScorers(goals: MatchApiItem['homeTeamGoalsDetails']): string {
    const details = Array.isArray(goals) ? goals : [];
    return details
      .map((goal) => `${goal.playerName} ${normalizeNonNegativeNumber(goal.minute)}'`)
      .join(' · ');
  }

  private buildCardsSummary(match: MatchApiItem): string | null {
    if (match.isPending) {
      return null;
    }

    const homeYellow = normalizeNonNegativeNumber(match.homeTeamTotalYellowCards);
    const homeRed = normalizeNonNegativeNumber(match.homeTeamTotalRedCards);
    const awayYellow = normalizeNonNegativeNumber(match.awayTeamTotalYellowCards);
    const awayRed = normalizeNonNegativeNumber(match.awayTeamTotalRedCards);

    if (homeYellow + homeRed + awayYellow + awayRed === 0) {
      return null;
    }
    return `Amarillas ${homeYellow}, Rojas ${homeRed} / Amarillas ${awayYellow}, Rojas ${awayRed}`;
  }

  private matchesStage(match: MatchApiItem, selectedStage: MatchStageCode): boolean {
    return selectedStage === 'ALL' || this.normalizeStage(match.stage) === selectedStage;
  }

  private normalizeStage(stage?: string): MatchStageCode {
    const normalized = (stage ?? '').trim().toUpperCase();
    return normalized in STAGE_LABELS ? (normalized as MatchStageCode) : 'ALL';
  }

  private hasActiveSimulation(worldCup: CurrentWorldCupApiResponse): boolean {
    return Boolean(worldCup?.worldCupId);
  }

  private createMatchesUnavailableException(): HttpException {
    return new HttpException(
      {
        messageCode: WorldCupCoreErrorCode.WC_MATCHES_UNAVAILABLE,
        message: MATCHES_UNAVAILABLE_MESSAGE,
      },
      HttpStatus.CONFLICT,
    );
  }
}
