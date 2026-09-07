import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { UiVisualsService } from '../../../../core/services/ui-visuals.service';
import type {
  HistoricalFairPlayHighlightItem,
  HistoricalPlayerHighlightItem,
  HistoricalPodiumTeamItem,
  HistoricalWorldCupItem,
  WorldCupHistoryApiResponse,
} from '../model/world-cup-history-api.interface';
import type { WorldCupHistoryViewModel } from '../model/world-cup-history-view-model.interface';

@Injectable({ providedIn: 'root' })
export class WorldCupHistoryService extends BaseApiService {
  private readonly uiVisualsService = inject(UiVisualsService);

  private readonly pageState: WorldCupHistoryViewModel = {
    lang: 'es',
    loading: false,
    errorMessage: '',
    showNoDataState: false,
    totalWorldCups: 0,
    worldCups: [],
  };

  getViewModel(): WorldCupHistoryViewModel {
    return this.pageState;
  }

  loadHistory(): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';
    this.pageState.showNoDataState = false;

    return this.get<WorldCupHistoryApiResponse>('/world-cup/history', { lang }).pipe(
      map((response) => response.data),
      tap((data) => {
        const worldCups = (data.worldCups ?? []).map((wc) => this.normalizeWorldCup(wc));
        this.pageState.totalWorldCups = data.totalWorldCups ?? 0;
        this.pageState.worldCups = worldCups;
        this.pageState.showNoDataState = worldCups.length === 0;
      }),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.pageState.worldCups = [];
        this.pageState.totalWorldCups = 0;
        this.pageState.showNoDataState = false;
        this.pageState.errorMessage =
          error.error?.responseMessage?.message ??
          error.error?.message ??
          'No se pudo cargar el historial de mundiales.';
        return of(undefined);
      }),
      finalize(() => {
        this.pageState.loading = false;
      }),
    );
  }

  private normalizeWorldCup(wc: HistoricalWorldCupItem): HistoricalWorldCupItem {
    return {
      ...wc,
      champion: this.normalizePodiumItem(wc.champion),
      runnerUp: this.normalizePodiumItem(wc.runnerUp),
      thirdPlace: this.normalizePodiumItem(wc.thirdPlace),
      fourthPlace: this.normalizePodiumItem(wc.fourthPlace),
      topScorer: this.normalizePlayerItem(wc.topScorer),
      topAssist: this.normalizePlayerItem(wc.topAssist),
      fairPlay: this.normalizeFairPlayItem(wc.fairPlay),
      worstFairPlay: this.normalizeFairPlayItem(wc.worstFairPlay),
    };
  }

  private normalizePodiumItem(item: HistoricalPodiumTeamItem): HistoricalPodiumTeamItem {
    if (!item?.hasData) return item;
    return { ...item, flag: this.uiVisualsService.getTeamFlag(item.teamId) };
  }

  private normalizePlayerItem(item: HistoricalPlayerHighlightItem): HistoricalPlayerHighlightItem {
    if (!item?.hasData) return item;
    return { ...item, teamFlag: this.uiVisualsService.getTeamFlag(item.teamId) };
  }

  private normalizeFairPlayItem(
    item: HistoricalFairPlayHighlightItem,
  ): HistoricalFairPlayHighlightItem {
    if (!item?.hasData) return item;
    return { ...item, teamFlag: this.uiVisualsService.getTeamFlag(item.teamId) };
  }
}
