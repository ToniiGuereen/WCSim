import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import {
  ApiErrorMappingRule,
  ApiErrorStatusMap,
  ErrorUtils,
} from '../../basic/error/error.utils';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';

interface CoachingCoach {
  coachId: string;
  teamId: string;
  teamName: string;
  name: string;
  age: number;
  nationality: string;
  profile: string;
  profileLabel?: string;
  profileDescription?: string;
  riskAppetite: number;
  gameManagement: number;
  adaptability: number;
  pressingBias: number;
  possessionBias: number;
  defenseBias: number;
  maxStrategyChanges: number;
}

interface CoachingTeamStrategy {
  teamId: string;
  strategy: string;
}

interface CoachingTeamFormation {
  teamId: string;
  formation: string;
}

interface CoachingTeamStats {
  attack: number;
  defense: number;
  midfield: number;
  overall: number;
  current_strategy: string;
  current_formation: string;
}

interface CoachingStrategyCatalogItem {
  strategy: string;
  description: string;
  compatibleFormations: string[];
  strategyLineImpact?: {
    attack: number;
    defense: number;
    midfield: number;
  };
}

interface CoachingFormationCatalogItem {
  formation: string;
  description: string;
  compatibleStrategies: string[];
}

interface CoachingProfileCatalogItem {
  code: string;
  label: string;
  description: string;
}

interface CoachingProfilesResponse {
  lang: string;
  coachProfiles: CoachingProfileCatalogItem[];
}

interface CoachingTeamRatingItem {
  metric: string;
  value: number;
}

interface CoachingTeamRatingDeltaItem {
  metric: string;
  strategyDelta: number;
  compatibilityPenalty: number;
  totalDelta: number;
}

interface CoachingCompatibility {
  selectedStrategy: string;
  selectedFormation: string;
  compatibleFormations: string[];
  compatibleStrategies: string[];
  byStrategy: Record<string, string[]>;
  byFormation: Record<string, string[]>;
  isSelectedPairCompatible: boolean;
}

interface CoachingOverviewData {
  teamId: string;
  coach: CoachingCoach | null;
  strategy: CoachingTeamStrategy | null;
  formation: CoachingTeamFormation | null;
  stats: CoachingTeamStats | null;
  baseRatings: CoachingTeamRatingItem[];
  effectiveRatings: CoachingTeamRatingItem[];
  ratingDeltas: CoachingTeamRatingDeltaItem[];
  strategyPenalty: number;
  strategies: CoachingStrategyCatalogItem[];
  formations: CoachingFormationCatalogItem[];
  compatibility: CoachingCompatibility;
}

interface CoachingUpdateResponse {
  teamId: string;
  strategy?: string;
  formation?: string;
}

const COACHING_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: 'WC_COACHING_UNAVAILABLE',
    message: 'Coaching data for the selected team was not found.',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: 'WC_COACHING_UNAVAILABLE',
    message: 'Coaching data is not available right now. Try again in a moment.',
  },
  [HttpStatus.BAD_REQUEST]: {
    messageCode: 'WC_COACHING_INVALID_REQUEST',
    message: 'Invalid coaching request.',
  },
};

const COACHING_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: 'WC_COACHING_UNAVAILABLE',
  message: 'Unable to load coaching data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class CoachingService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getCoachingOverview(lang?: string): Promise<CoachingOverviewData> {
    try {
      const teamId = this.getCurrentTeamId();
      const resolvedLang = this.resolveLang(lang);

      const [
        coaches,
        stats,
        strategy,
        formation,
        profilesResponse,
        strategies,
        formations,
      ] = await Promise.all([
        this.worldCupFeatureApiService.getTeamCoaches<CoachingCoach[]>(teamId),
        this.worldCupFeatureApiService.getTeamStats(teamId, resolvedLang),
        this.worldCupFeatureApiService.getTeamStrategy<CoachingTeamStrategy>(teamId),
        this.worldCupFeatureApiService.getTeamFormation<CoachingTeamFormation>(teamId),
        this.worldCupFeatureApiService.getCoachProfiles<CoachingProfilesResponse>(
          resolvedLang,
        ),
        this.worldCupFeatureApiService.listStrategies<CoachingStrategyCatalogItem[]>(
          resolvedLang,
        ),
        this.worldCupFeatureApiService.listFormations<CoachingFormationCatalogItem[]>(
          resolvedLang,
        ),
      ]);

      const normalizedStats = stats as CoachingTeamStats;
      const coach = this.enrichCoach(coaches[0] ?? null, profilesResponse);

      const selectedStrategy =
        strategy?.strategy ?? normalizedStats?.current_strategy ?? '';

      const selectedFormation =
        formation?.formation ?? normalizedStats?.current_formation ?? '';

      const compatibility = this.buildCompatibility(
        selectedStrategy,
        selectedFormation,
        strategies,
        formations,
      );

      const baseRatings = this.buildBaseRatings(normalizedStats);

      const ratingDeltas = this.buildRatingDeltas(
        baseRatings,
        selectedStrategy,
        compatibility.isSelectedPairCompatible,
        strategies,
      );

      const effectiveRatings = this.buildEffectiveRatings(baseRatings, ratingDeltas);

      return {
        teamId,
        coach,
        strategy,
        formation,
        stats: normalizedStats,
        baseRatings,
        effectiveRatings,
        ratingDeltas,
        strategyPenalty: compatibility.isSelectedPairCompatible ? 0 : -5,
        strategies,
        formations,
        compatibility,
      };
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        COACHING_API_ERROR_STATUS_MAP,
        COACHING_API_ERROR_FALLBACK,
      );
    }
  }

  public async updateStrategy(strategy: string): Promise<CoachingUpdateResponse> {
    try {
      const teamId = this.getCurrentTeamId();
      const normalizedStrategy = this.normalizeRequiredValue(strategy, 'strategy');

      return await this.worldCupFeatureApiService.selectTeamStrategy<CoachingUpdateResponse>(
        teamId,
        normalizedStrategy,
      );
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        COACHING_API_ERROR_STATUS_MAP,
        COACHING_API_ERROR_FALLBACK,
      );
    }
  }

  public async updateFormation(formation: string): Promise<CoachingUpdateResponse> {
    try {
      const teamId = this.getCurrentTeamId();
      const normalizedFormation = this.normalizeRequiredValue(formation, 'formation');

      return await this.worldCupFeatureApiService.selectTeamFormation<CoachingUpdateResponse>(
        teamId,
        normalizedFormation,
      );
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        COACHING_API_ERROR_STATUS_MAP,
        COACHING_API_ERROR_FALLBACK,
      );
    }
  }

  public async resetTactics(): Promise<CoachingUpdateResponse> {
    try {
      const teamId = this.getCurrentTeamId();

      return await this.worldCupFeatureApiService.resetTeamTactics<CoachingUpdateResponse>(
        teamId,
      );
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        COACHING_API_ERROR_STATUS_MAP,
        COACHING_API_ERROR_FALLBACK,
      );
    }
  }

  private normalizeRequiredValue(value: string, fieldName: string): string {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return normalizedValue;
  }

  private enrichCoach(
    coach: CoachingCoach | null,
    profilesResponse: CoachingProfilesResponse,
  ): CoachingCoach | null {
    if (!coach) {
      return null;
    }

    const profile = profilesResponse.coachProfiles.find(
      (item) => item.code === coach.profile,
    );

    return {
      ...coach,
      profileLabel: profile?.label ?? coach.profile,
      profileDescription: profile?.description ?? '',
    };
  }

  private buildBaseRatings(
    stats: CoachingTeamStats | null,
  ): CoachingTeamRatingItem[] {
    if (!stats) {
      return [];
    }

    return [
      { metric: 'ATTACK', value: stats.attack },
      { metric: 'MIDFIELD', value: stats.midfield },
      { metric: 'DEFENSE', value: stats.defense },
      { metric: 'OVERALL', value: stats.overall },
    ];
  }

  private buildCompatibility(
    selectedStrategy: string,
    selectedFormation: string,
    strategies: CoachingStrategyCatalogItem[],
    formations: CoachingFormationCatalogItem[],
  ): CoachingCompatibility {
    const strategyItem = strategies.find(
      (item) => item.strategy === selectedStrategy,
    );

    const formationItem = formations.find(
      (item) => item.formation === selectedFormation,
    );

    const compatibleFormations = strategyItem?.compatibleFormations ?? [];
    const compatibleStrategies = formationItem?.compatibleStrategies ?? [];

    return {
      selectedStrategy,
      selectedFormation,
      compatibleFormations,
      compatibleStrategies,
      byStrategy: this.buildCompatibilityByStrategy(strategies),
      byFormation: this.buildCompatibilityByFormation(formations),
      isSelectedPairCompatible: compatibleFormations.includes(selectedFormation),
    };
  }

  private buildCompatibilityByStrategy(
    strategies: CoachingStrategyCatalogItem[],
  ): Record<string, string[]> {
    return strategies.reduce<Record<string, string[]>>((accumulator, item) => {
      accumulator[item.strategy] = item.compatibleFormations;
      return accumulator;
    }, {});
  }

  private buildCompatibilityByFormation(
    formations: CoachingFormationCatalogItem[],
  ): Record<string, string[]> {
    return formations.reduce<Record<string, string[]>>((accumulator, item) => {
      accumulator[item.formation] = item.compatibleStrategies;
      return accumulator;
    }, {});
  }

  private buildRatingDeltas(
    baseRatings: CoachingTeamRatingItem[],
    selectedStrategy: string,
    isCompatible: boolean,
    strategies: CoachingStrategyCatalogItem[],
  ): CoachingTeamRatingDeltaItem[] {
    const strategyImpact = strategies.find(
      (item) => item.strategy === selectedStrategy,
    )?.strategyLineImpact;

    return baseRatings.map((rating) => {
      const metricKey = rating.metric.toLowerCase() as
        | 'attack'
        | 'midfield'
        | 'defense'
        | 'overall';

      const strategyDelta =
        metricKey === 'overall' ? 0 : strategyImpact?.[metricKey] ?? 0;

      const compatibilityPenalty = isCompatible ? 0 : -5;

      return {
        metric: rating.metric,
        strategyDelta,
        compatibilityPenalty,
        totalDelta: strategyDelta + compatibilityPenalty,
      };
    });
  }

  private buildEffectiveRatings(
    baseRatings: CoachingTeamRatingItem[],
    ratingDeltas: CoachingTeamRatingDeltaItem[],
  ): CoachingTeamRatingItem[] {
    return baseRatings.map((rating) => {
      const delta = ratingDeltas.find((item) => item.metric === rating.metric);
      const effectiveValue = rating.value + (delta?.totalDelta ?? 0);

      return {
        metric: rating.metric,
        value: Math.max(0, Math.min(100, effectiveValue)),
      };
    });
  }
}