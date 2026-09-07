// backend/world-cup-core/src/teams/services/rivals.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';

// Tipos internos del servicio (lo que devuelve la WorldCupAPI)
interface RivalApiItem {
  id: string;
  name: string;
}

interface CoachApiItem {
  teamId: string;
  name: string;
  nationality?: string;
}

interface TeamApiItem {
  id?: string;
  name?: string;
  shortCode?: string;
  flagEmoji?: string;
  confederation?: string;
  overall?: number;
  formation?: string;
  strategy?: string;
  strategyLabel?: string;
  captain?: { name: string };
}

interface TeamStatsApiItem {
  overall?: number;
}

// Modelo de respuesta al frontend
export interface RivalEnrichedItem {
  id: string;
  name: string;
  shortCode: string;
  flag: string;
  confederation: string;
  overallRating: number;
  coachName: string;
  captainName: string;
  strategy: string;
  strategyLabel: string;
  formation: string;
}

export interface RivalsResponseModel {
  teamId: string;
  totalRivals: number;
  rivals: RivalEnrichedItem[];
}

const RIVALS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_RIVALS_UNAVAILABLE,
    message: 'Rivals data for the selected team was not found.',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_RIVALS_UNAVAILABLE,
    message: 'Rivals data is not available right now. Try again in a moment.',
  },
};

const RIVALS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_RIVALS_UNAVAILABLE,
  message: 'Unable to load rivals data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class RivalsService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getRivals(): Promise<RivalsResponseModel> {
    try {
      const teamId = this.getCurrentTeamId();

      // 1. Lista de rivales del equipo
      const rivalsRaw = await this.worldCupFeatureApiService
        .getTeamRivals<RivalApiItem[]>(teamId);

      if (!Array.isArray(rivalsRaw) || rivalsRaw.length === 0) {
        return { teamId, totalRivals: 0, rivals: [] };
      }

      // 2. Enriquecer cada rival en paralelo
      const rivals = await Promise.all(
        rivalsRaw.map((rival) => this.enrichRival(rival)),
      );

      return { teamId, totalRivals: rivals.length, rivals };

    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        RIVALS_API_ERROR_STATUS_MAP,
        RIVALS_API_ERROR_FALLBACK,
      );
    }
  }

  private async enrichRival(rival: RivalApiItem): Promise<RivalEnrichedItem> {
    const [teamResult, coachResult, statsResult] = await Promise.allSettled([
      this.worldCupFeatureApiService.listTeams(rival.id) as Promise<TeamApiItem[]>,
      this.worldCupFeatureApiService.getTeamCoaches<CoachApiItem[]>(rival.id),
      this.worldCupFeatureApiService.getTeamStats(rival.id) as Promise<TeamStatsApiItem>,
    ]);

    const teamData: TeamApiItem | null =
      teamResult.status === 'fulfilled' && Array.isArray(teamResult.value)
        ? teamResult.value[0] ?? null
        : null;

    const coachData: CoachApiItem | null =
      coachResult.status === 'fulfilled' && Array.isArray(coachResult.value)
        ? coachResult.value[0] ?? null
        : null;

    const overallRating =
      statsResult.status === 'fulfilled'
        ? (statsResult.value?.overall ?? 0)
        : 0;

    return {
      id: rival.id,
      name: rival.name ?? teamData?.name ?? rival.id,
      shortCode: teamData?.shortCode ?? rival.id.toUpperCase(),
      flag: teamData?.flagEmoji ?? '🏳️',
      confederation: teamData?.confederation ?? '-',
      overallRating,
      coachName: coachData?.name ?? '-',
      captainName: teamData?.captain?.name ?? '-',
      strategy: teamData?.strategy ?? '-',
      strategyLabel: teamData?.strategyLabel ?? teamData?.strategy ?? '-',
      formation: teamData?.formation ?? '-',
    };
  }
}