import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';
import type {
  HistoricalFairPlayHighlightItem,
  HistoricalPlayerHighlightItem,
  HistoricalPodiumTeamItem,
  HistoricalWorldCupItem,
  WorldCupAwardApiItem,
  WorldCupHistoryScreenModel,
  WorldCupMetadataApiItem,
  WorldCupPlayerStatApiItem,
  WorldCupPodiumTeamApiItem,
  WorldCupStatsApiItem,
} from './model/world-cup-history-service.interface';

const HISTORY_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_HISTORY_UNAVAILABLE,
    message: 'No se encontró el historial de mundiales.',
    statusCode: HttpStatus.NOT_FOUND,
  },
};

const HISTORY_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_HISTORY_FETCH_FAILED,
  message: 'No se pudo obtener el historial de mundiales desde la WorldCupAPI.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class WorldCupHistoryService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getHistory(lang?: string): Promise<WorldCupHistoryScreenModel> {
    const resolvedLang = this.resolveLang(lang);
    try {
      const worldCupIds =
        await this.worldCupFeatureApiService.getWorldCupHistory();

      if (!worldCupIds.length) {
        return { lang: resolvedLang, totalWorldCups: 0, worldCups: [] };
      }

      const metadataList = await Promise.all(
        worldCupIds.map((id) =>
          this.worldCupFeatureApiService.getWorldCupById<WorldCupMetadataApiItem>(id),
        ),
      );

      const endedWorldCups = metadataList.filter((wc) => wc.status === 'ENDED');

      if (!endedWorldCups.length) {
        return { lang: resolvedLang, totalWorldCups: 0, worldCups: [] };
      }

      const worldCups = await Promise.all(
        endedWorldCups.map(async (wc) => {
          const [stats, awards] = await Promise.all([
            this.worldCupFeatureApiService.getWorldCupStats<WorldCupStatsApiItem>(wc.worldCupId),
            this.worldCupFeatureApiService.getWorldCupAwards<WorldCupAwardApiItem[]>(
              wc.worldCupId,
              resolvedLang,
            ),
          ]);
          return this.buildHistoricalItem(wc, stats, awards);
        }),
      );

      return { lang: resolvedLang, totalWorldCups: worldCups.length, worldCups };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorUtils.mapWorldCupApiError(
        error,
        HISTORY_API_ERROR_STATUS_MAP,
        HISTORY_API_ERROR_FALLBACK,
      );
    }
  }

  private buildHistoricalItem(
    wc: WorldCupMetadataApiItem,
    stats: WorldCupStatsApiItem,
    awards: WorldCupAwardApiItem[],
  ): HistoricalWorldCupItem {
    const fairPlayAward = awards.find((a) => a.code === 'FAIR_PLAY') ?? null;
    const topScorer = stats.topScorers?.[0] ?? null;
    const topAssist = stats.topAssists?.[0] ?? null;

    return {
      worldCupId: wc.worldCupId,
      worldCupIdShort: this.shortenWorldCupId(wc.worldCupId),
      finalPlayedAt: wc.updatedAt ?? null,
      edition: wc.edition,
      editionLabel: `Mundial ${wc.edition}`,
      status: wc.status,
      statusLabel: 'Finalizado',
      champion: this.buildPodiumItem(stats.champion),
      runnerUp: this.buildPodiumItem(stats.runnerUp),
      thirdPlace: this.buildPodiumItem(stats.thirdPlace),
      fourthPlace: this.buildPodiumItem(stats.fourthPlace),
      totalMatches: stats.totalMatches ?? 0,
      totalGoals: stats.totalGoals ?? 0,
      avgGoalsPerMatch: stats.avgGoalsPerMatch ?? 0,
      yellowCards: stats.cards?.totalYellowCards ?? 0,
      redCards: stats.cards?.totalRedCards ?? 0,
      finalScoreLabel: '',
      finalResolutionLabel: '',
      topScorer: this.buildPlayerItem(topScorer),
      topAssist: this.buildPlayerItem(topAssist),
      fairPlay: this.buildFairPlayItem(fairPlayAward),
      worstFairPlay: this.buildEmptyFairPlayItem(),
    };
  }

  private buildPodiumItem(team: WorldCupPodiumTeamApiItem | null): HistoricalPodiumTeamItem {
    if (!team) {
      return { teamId: '', teamName: '', flag: '', hasData: false };
    }
    return { teamId: team.teamId, teamName: team.teamName, flag: '', hasData: true };
  }

  private buildPlayerItem(player: WorldCupPlayerStatApiItem | null): HistoricalPlayerHighlightItem {
    if (!player) {
      return { playerName: '', teamId: '', teamName: '', teamFlag: '', value: 0, hasData: false };
    }
    return {
      playerName: player.playerName,
      teamId: player.teamId,
      teamName: player.teamName,
      teamFlag: '',
      value: player.value,
      hasData: true,
    };
  }

  private buildFairPlayItem(award: WorldCupAwardApiItem | null): HistoricalFairPlayHighlightItem {
    if (!award) {
      return this.buildEmptyFairPlayItem();
    }
    return {
      teamId: award.teamId,
      teamName: award.teamName,
      teamFlag: '',
      fairPlayPoints: award.fairPlayPoints ?? 0,
      yellowCards: award.yellowCards ?? 0,
      redCards: award.redCards ?? 0,
      fairPlayRank: 1,
      totalRankedTeams: 0,
      hasData: true,
    };
  }

  private buildEmptyFairPlayItem(): HistoricalFairPlayHighlightItem {
    return {
      teamId: '',
      teamName: '',
      teamFlag: '',
      fairPlayPoints: 0,
      yellowCards: 0,
      redCards: 0,
      fairPlayRank: 0,
      totalRankedTeams: 0,
      hasData: false,
    };
  }

  private shortenWorldCupId(worldCupId: string): string {
    const parts = worldCupId.split('_');
    return parts.length >= 3 ? parts.slice(2).join('_') : worldCupId;
  }
}
