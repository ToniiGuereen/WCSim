import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';



interface PodiumTeamApi {
  teamId: string;
  teamName: string;
}

interface PlayerStatApi {
  playerName: string;
  teamId: string;
  teamName: string;
  value: number;
}

interface CardStatsApi {
  totalYellowCards: number;
  totalRedCards: number;
}

interface WorldCupStatsApiRaw {
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  cards: CardStatsApi;
  champion: PodiumTeamApi | null;
  runnerUp: PodiumTeamApi | null;
  thirdPlace: PodiumTeamApi | null;
  fourthPlace: PodiumTeamApi | null;
  topScorers: PlayerStatApi[];
  topAssists: PlayerStatApi[];
}

interface AwardApi {
  code: string;
  winnerName: string;
  teamId: string;
  teamName: string;
  reason: string;
}



export interface PodiumItem {
  place: string;
  placeLabel: string;
  medal: string;
  teamId: string;
  teamName: string;
}

export interface LeaderboardItem {
  rank: number;
  playerName: string;
  teamId: string;
  teamName: string;
  value: number;
}

export interface AwardItem {
  code: string;
  title: string;
  icon: string;
  winnerName: string;
  teamId: string;
  teamName: string;
  reason: string;
}

export interface StatsAwardsResponse {
  worldCupEnded: boolean;
  worldCupId: string | null;
  teamId: string;
  lang: string;
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  totalYellowCards: number;
  totalRedCards: number;
  podium: PodiumItem[];
  topScorers: LeaderboardItem[];
  topAssists: LeaderboardItem[];
  awards: AwardItem[];
}



const AWARD_META: Record<string, { title: string; icon: string }> = {
  GOLDEN_BALL:      { title: 'Balón de Oro',     icon: '🏆' },
  GOLDEN_BOOT:      { title: 'Bota de Oro',       icon: '👟' },
  GOLDEN_GLOVE:     { title: 'Guante de Oro',     icon: '🧤' },
  FAIR_PLAY:        { title: 'Fair Play',          icon: '🤝' },
  BEST_YOUNG_PLAYER:{ title: 'Mejor Jugador Joven', icon: '⭐' },
  PLAYER_OF_MATCH:  { title: 'Jugador del Torneo', icon: '🌟' },
};



const STATS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_STATS_UNAVAILABLE,
    message: 'No hay una simulación activa. Simulá el mundial primero.',
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_STATS_UNAVAILABLE,
    message: 'No hay una simulación activa. Simulá el mundial primero.',
    statusCode: HttpStatus.CONFLICT,
  },
};

const STATS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_STATS_FETCH_FAILED,
  message: 'No se pudieron cargar las estadísticas desde la WorldCupAPI.',
  statusCode: HttpStatus.BAD_GATEWAY,
};



@Injectable()
export class StatsAwardsService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getStatsAndAwards(lang?: string): Promise<StatsAwardsResponse> {
    const resolvedLang = this.resolveLang(lang);
    const teamId = this.getCurrentTeamId();

    try {
      const current = await this.worldCupFeatureApiService.getCurrentWorldCup(resolvedLang);
      const worldCupStatus = ((current as any)?.status ?? '').trim().toUpperCase();
      const worldCupId = (current as any)?.worldCupId ?? null;

      if (worldCupStatus !== 'ENDED') {
        return this.buildEmptyResponse(teamId, resolvedLang, worldCupId);
      }

      const [rawStats, rawAwards] = await Promise.all([
        this.worldCupFeatureApiService.getCurrentWorldCupStats(resolvedLang),
        this.worldCupFeatureApiService.getCurrentWorldCupAwards(resolvedLang),
      ]);

      const s = rawStats as WorldCupStatsApiRaw;
      const a = (rawAwards ?? []) as AwardApi[];

      return {
        worldCupEnded: true,
        worldCupId,
        teamId,
        lang: resolvedLang,
        totalMatches: s?.totalMatches ?? 0,
        totalGoals: s?.totalGoals ?? 0,
        avgGoalsPerMatch: s?.avgGoalsPerMatch ?? 0,
        totalYellowCards: s?.cards?.totalYellowCards ?? 0,
        totalRedCards: s?.cards?.totalRedCards ?? 0,
        podium: this.buildPodium(s),
        topScorers: this.buildLeaderboard(s?.topScorers),
        topAssists: this.buildLeaderboard(s?.topAssists),
        awards: this.buildAwards(a),
      };
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        STATS_API_ERROR_STATUS_MAP,
        STATS_API_ERROR_FALLBACK,
      );
    }
  }

  
  private buildPodium(s: WorldCupStatsApiRaw): PodiumItem[] {
    const entries: Array<{ place: string; placeLabel: string; medal: string; team: PodiumTeamApi | null }> = [
      { place: 'CHAMPION',    placeLabel: 'Campeón',        medal: '🥇', team: s?.champion    ?? null },
      { place: 'RUNNER_UP',   placeLabel: 'Subcampeón',     medal: '🥈', team: s?.runnerUp    ?? null },
      { place: 'THIRD_PLACE', placeLabel: 'Tercer puesto',  medal: '🥉', team: s?.thirdPlace  ?? null },
      { place: 'FOURTH_PLACE',placeLabel: 'Cuarto puesto',  medal: '4️⃣', team: s?.fourthPlace ?? null },
    ];

    return entries
      .filter(e => e.team !== null)
      .map(e => ({
        place: e.place,
        placeLabel: e.placeLabel,
        medal: e.medal,
        teamId: e.team!.teamId,
        teamName: e.team!.teamName,
      }));
  }

  
  private buildLeaderboard(players: PlayerStatApi[]): LeaderboardItem[] {
    if (!Array.isArray(players)) return [];
    return players.map((p, index) => ({
      rank: index + 1,
      playerName: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      value: p.value,
    }));
  }

  
  private buildAwards(awards: AwardApi[]): AwardItem[] {
    if (!Array.isArray(awards)) return [];
    return awards.map(a => {
      const meta = AWARD_META[a.code] ?? { title: a.code, icon: '🏅' };
      return {
        code: a.code,
        title: meta.title,
        icon: meta.icon,
        winnerName: a.winnerName,
        teamId: a.teamId,
        teamName: a.teamName,
        reason: a.reason,
      };
    });
  }

  private buildEmptyResponse(teamId: string, lang: string, worldCupId: string | null): StatsAwardsResponse {
    return {
      worldCupEnded: false,
      worldCupId,
      teamId,
      lang,
      totalMatches: 0,
      totalGoals: 0,
      avgGoalsPerMatch: 0,
      totalYellowCards: 0,
      totalRedCards: 0,
      podium: [],
      topScorers: [],
      topAssists: [],
      awards: [],
    };
  }
}
