import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AdminService } from "../../admin/admin.service";
import { AbstractBaseService } from "../../basic/abstract-base.service";
import { WorldCupFeatureApiService } from "../../basic/world-cup-feature-api.service";
import type {
  JourneyApiMatch,
  JourneyApiResponse,
} from "./model/journey-service.interface";
import {
  JourneyMatchModel,
  JourneyScreenModel,
} from "./model/journey-service.model";

import {
  ApiErrorMappingRule,
  ApiErrorStatusMap,
  ErrorUtils,
} from "../../basic/error/error.utils";
import { WorldCupCoreErrorCode } from "../../basic/model/world-cup-core-error-code.enum";

const JOURNEY_UNAVAILABLE_MESSAGE =
  "No hay una simulación activa para mostrar el camino del equipo.";

const JOURNEY_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_JOURNEY_UNAVAILABLE,
    message: JOURNEY_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_JOURNEY_UNAVAILABLE,
    message: JOURNEY_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
};

const JOURNEY_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_JOURNEY_FETCH_FAILED,
  message: "No se pudo obtener el camino del equipo desde la WorldCupAPI.",
  statusCode: HttpStatus.BAD_GATEWAY,
};

const RESULT_LABELS: Record<string, string> = {
  WIN: "Victoria",
  LOSS: "Derrota",
  DRAW: "Empate",
  PENDING: "Pendiente",
};

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "Dieciseisavos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINALS: "Cuartos",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

const RESOLUTION_LABELS: Record<string, string> = {
  REGULAR_TIME: "Tiempo regular",
  EXTRA_TIME: "Tiempo extra",
  PENALTIES: "Penales",
  PENDING: "Pendiente",
};

@Injectable()
export class JourneyService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getJourney(lang?: string): Promise<JourneyScreenModel> {
    const teamId = this.getCurrentTeamId();
    const resolvedLang = this.resolveLang(lang);
    try {
      const journey =
        await this.worldCupFeatureApiService.getCurrentTeamJourney(
          teamId,
          resolvedLang,
        );

      return this.mapToJourneyScreenModel(journey);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorUtils.mapWorldCupApiError(
        error,
        JOURNEY_API_ERROR_STATUS_MAP,
        JOURNEY_API_ERROR_FALLBACK,
      );
    }
  }

  private mapToJourneyScreenModel(
    journey: JourneyApiResponse,
  ): JourneyScreenModel {
    const matches = journey.matches.map((match: JourneyApiMatch) =>
      this.mapToJourneyMatchModel(match),
    );

    return new JourneyScreenModel({
      worldCupId: journey.worldCupId,
      teamId: journey.teamId,
      teamName: journey.teamName,
      lang: journey.lang,
      worldCupStatus: journey.worldCupStatus,
      stageReached: journey.stageReached,
      isChampion: journey.isChampion,
      isFinalPending: journey.isFinalPending,
      eliminatedByTeamId: journey.eliminatedByTeamId,
      eliminatedByTeamName: journey.eliminatedByTeamName,
      summary: journey.summary,
      matches,
      stageReachedLabel: this.getStageLabel(journey.stageReached),
      matchesPlayed: journey.matches.filter(
        (match: JourneyApiMatch) => !match.isPending,
      ).length,
    });
  }

  private mapToJourneyMatchModel(match: JourneyApiMatch): JourneyMatchModel {
    return new JourneyMatchModel({
      stage: match.stage,
      matchCode: match.matchCode,
      opponentTeamId: match.opponentTeamId,
      opponentTeamName: match.opponentTeamName,
      goalsFor: match.goalsFor,
      goalsAgainst: match.goalsAgainst,
      result: match.result,
      resolution: match.resolution,
      isPending: match.isPending,

      stageLabel: this.getStageLabel(match.stage),
      opponentFlag: "",
      scoreLabel: this.getScoreLabel(match),
      resultLabel: this.getResultLabel(match.result),
      resultStyle: match.result,
      resolutionLabel: this.getResolutionLabel(match.resolution),
    });
  }

  private getStageLabel(stage: string): string {
    return STAGE_LABELS[stage] ?? stage;
  }

  private getScoreLabel(match: JourneyApiMatch): string {
    return match.isPending
      ? "Pendiente"
      : `${match.goalsFor} - ${match.goalsAgainst}`;
  }

  private getResultLabel(result: string): string {
    return RESULT_LABELS[result] ?? result;
  }

  private getResolutionLabel(resolution: string): string {
    return RESOLUTION_LABELS[resolution] ?? resolution;
  }
}
