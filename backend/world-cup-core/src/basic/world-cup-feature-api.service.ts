import { Injectable } from "@nestjs/common";
import { AdminService } from "../admin/admin.service";
import type {
  GameDictionaryApiResponse,
  SquadPlayerApiItem,
} from "../teams/services/model/squad-service.interface";
import type { TeamHistoryApiResponse } from "../teams/services/model/team-history-service.interface";
import type {
  CurrentWorldCupApiResponse,
  TeamCatalogApiItem,
  TeamStatsApiResponse,
} from "../world-cup/services/model/simulation-service.interface";
import { AbstractBaseService } from "./abstract-base.service";
import { LanguageEnum } from "./model/language.enum";
import { WorldCupApiService } from "./world-cup-api.service";

import type { JourneyApiResponse } from "../world-cup/services/model/journey-service.interface";
import type { MatchApiItem } from "../world-cup/services/model/matches-service.interface";

@Injectable()
export class WorldCupFeatureApiService extends AbstractBaseService {
  constructor(
    worldCupApiService: WorldCupApiService,
    adminService: AdminService,
  ) {
    super(adminService, worldCupApiService);
  }

  public getCurrentTeamId(): string {
    return super.getCurrentTeamId();
  }

  public getCurrentLang(): LanguageEnum {
    return super.getCurrentLang();
  }

  public async getTeamPlayers(
    teamId: string,
    lang?: string,
  ): Promise<SquadPlayerApiItem[]> {
    // WorldCupAPI.com uses /squads endpoint with team_id parameter
    return this.getEndpointData<SquadPlayerApiItem[]>(
      `/squads`,
      {
        team_id: teamId,
        lang: this.resolveLang(lang),
      },
    );
  }

  public async getGameDictionary(
    lang?: string,
  ): Promise<GameDictionaryApiResponse> {
    return this.getEndpointData<GameDictionaryApiResponse>(
      "/reference/game-dictionary",
      {
        lang: this.resolveLang(lang),
      },
    );
  }

  public async getTeamHistory(
    teamId: string,
    lang?: string,
  ): Promise<TeamHistoryApiResponse> {
    return this.getEndpointData<TeamHistoryApiResponse>(
      `/teams/${teamId}/history`,
      {
        lang: this.resolveLang(lang),
      },
    );
  }

  public async listTeams(
    teamId?: string,
    name?: string,
  ): Promise<TeamCatalogApiItem[]> {
    return this.getEndpointData<TeamCatalogApiItem[]>("/teams", {
      teamId: teamId?.trim().toLowerCase(),
      name: name?.trim(),
    });
  }

  public async getTeamStats(
    teamId: string,
    lang?: string,
  ): Promise<TeamStatsApiResponse> {
    return this.getEndpointData<TeamStatsApiResponse>(
      `/teams/${teamId}/stats`,
      {
        lang: this.resolveLang(lang),
      },
    );
  }

  public async getCurrentWorldCup(
    lang?: string,
  ): Promise<CurrentWorldCupApiResponse> {
    return this.getEndpointData<CurrentWorldCupApiResponse>(
      "/world-cup/current",
      {
        lang: this.resolveLang(lang),
      },
    );
  }

  public async simulateWorldCup(
    teamId: string,
    lang?: string,
  ): Promise<CurrentWorldCupApiResponse> {
    return this.postEndpointData<CurrentWorldCupApiResponse>(
      "/world-cup/simulate",
      {
        teamId,
        lang: this.resolveLang(lang),
      },
    );
  }

  // Obtiene desde la WorldCupAPI el recorrido del equipo.
  public async getCurrentTeamJourney(
    teamId: string,
    lang?: string,
  ): Promise<JourneyApiResponse> {
    return this.getEndpointData<JourneyApiResponse>(
      `/world-cup/current/teams/${teamId}/journey`,
      {
        lang: this.resolveLang(lang),
      },
    );
  }

  public async getCurrentMatches(stage?: string, lang?: string): Promise<MatchApiItem[]> {
    return this.getEndpointData<MatchApiItem[]>('/world-cup/current/matches', {
      stage,
      lang: this.resolveLang(lang),
    });
  }

  public async getTeamCoaches<T = unknown>(teamId: string): Promise<T> {
    return this.getEndpointData<T>('/teams/coaches', {
      teamId,
    });
  }

  public async getTeamStrategy<T = unknown>(teamId: string): Promise<T> {
    return this.getEndpointData<T>(`/teams/${teamId}/strategy`);
  }

  public async getTeamFormation<T = unknown>(teamId: string): Promise<T> {
    return this.getEndpointData<T>(`/teams/${teamId}/formation`);
  }

  public async getCoachProfiles<T = unknown>(lang?: string): Promise<T> {
    return this.getEndpointData<T>('/reference/coach-profiles', {
      lang: this.resolveLang(lang),
    });
  }

  public async listStrategies<T = unknown>(lang?: string): Promise<T> {
    return this.getEndpointData<T>('/match/strategies', {
      lang: this.resolveLang(lang),
    });
  }

  public async listFormations<T = unknown>(lang?: string): Promise<T> {
    return this.getEndpointData<T>('/match/formations', {
      lang: this.resolveLang(lang),
    });
 
  }
  public async selectTeamStrategy<T = unknown>(teamId: string,strategy: string,): Promise<T> {
    return this.postEndpointData<T>('/match/select-strategy', {
      teamId,
      strategy,
    });
  }

  public async selectTeamFormation<T = unknown>(teamId: string,formation: string,): Promise<T> {
    return this.postEndpointData<T>('/match/select-formation', {
      teamId,
      formation,
    });
  }

  public async resetTeamTactics<T = unknown>(teamId: string): Promise<T> {
    return this.postEndpointData<T>('/match/reset-team-tactics', {
      teamId,
    });
  }

  public async getWorldCupHistory(): Promise<string[]> {
    return this.getEndpointData<string[]>('/world-cup/history');
  }

  public async getWorldCupById<T = unknown>(worldCupId: string): Promise<T> {
    return this.getEndpointData<T>(`/world-cup/${worldCupId}`);
  }

  public async getWorldCupStats<T = unknown>(worldCupId: string): Promise<T> {
    return this.getEndpointData<T>(`/world-cup/${worldCupId}/stats`);
  }

  public async getWorldCupAwards<T = unknown>(worldCupId: string, lang?: string): Promise<T> {
    return this.getEndpointData<T>(`/world-cup/${worldCupId}/awards`, {
      lang: this.resolveLang(lang),
    });
  }

  public async getTeamRivals<T = unknown>(teamId: string): Promise<T> {
    return this.getEndpointData<T>(`/teams/${teamId}/rivals`);
  }

  public async getCurrentWorldCupStats<T = unknown>(lang?: string): Promise<T> {
    return this.getEndpointData<T>('/world-cup/current/stats', {
      lang: this.resolveLang(lang),
    });
  }

  public async getCurrentWorldCupAwards<T = unknown>(lang?: string): Promise<T> {
    return this.getEndpointData<T>('/world-cup/current/awards', {
      lang: this.resolveLang(lang),
    });
  }
}
