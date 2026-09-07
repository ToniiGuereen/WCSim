import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { UiVisualsService } from '../../../../core/services/ui-visuals.service';
import { MatchCardApiItem, MatchStageCode, MatchesApiResponse } from '../model/matches-api.interface';
import { MatchesViewModel } from '../model/matches-view-model.interface';

@Injectable({ providedIn: 'root' })
export class MatchesService extends BaseApiService {
  private readonly uiVisualsService = inject(UiVisualsService);
  private pageState: MatchesViewModel = this.buildInitialState();

  public getViewModel(): MatchesViewModel {
    return this.pageState;
  }

  public initialize(): void {
    this.loadMatches(this.pageState.selectedStage).subscribe();
  }

  public setStage(stage: MatchStageCode): void {
    this.pageState.selectedStage = stage;
    this.loadMatches(stage).subscribe();
  }

  private loadMatches(stage: MatchStageCode): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';

    return this.get<MatchesApiResponse>('/world-cup/matches', { lang, stage }).pipe(
      map((response) => response.data),
      tap((data) => this.applyResponse(data)),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        if (this.isMatchesUnavailableError(error)) {
          this.resetState();
          this.pageState.showNoSimulationState = true;
          return of(undefined);
        }

        this.resetState();
        this.pageState.errorMessage = 'No se pudieron cargar los partidos del Mundial.';
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }

  private applyResponse(data: MatchesApiResponse): void {
    this.pageState.matches = this.enrichFlags(data?.matches ?? []);
    this.pageState.stages = data?.availableStages ?? [];
    this.pageState.selectedStage = data?.selectedStage ?? 'ALL';
    this.pageState.totalMatches = data?.totalMatches ?? 0;
    this.pageState.playedMatches = data?.playedMatches ?? 0;
    this.pageState.pendingMatches = data?.pendingMatches ?? 0;
    this.pageState.showNoSimulationState = false;
  }

  private enrichFlags(matches: MatchCardApiItem[]): MatchCardApiItem[] {
    return matches.map((match) => ({
      ...match,
      homeFlag: this.uiVisualsService.getTeamFlag(match.homeTeamId),
      awayFlag: this.uiVisualsService.getTeamFlag(match.awayTeamId),
      winnerFlag: match.winnerTeamId ? this.uiVisualsService.getTeamFlag(match.winnerTeamId) : null,
      playerOfMatchFlag: match.playerOfMatchTeamId
        ? this.uiVisualsService.getTeamFlag(match.playerOfMatchTeamId)
        : null,
    }));
  }

  private isMatchesUnavailableError(error: HttpErrorResponse): boolean {
    const messageCode = (error?.error as { responseMessage?: { messageCode?: string } } | undefined)
      ?.responseMessage?.messageCode;

    return messageCode === 'WC_MATCHES_UNAVAILABLE';
  }

  private resetState(): void {
    this.pageState.matches = [];
    this.pageState.stages = [];
    this.pageState.totalMatches = 0;
    this.pageState.playedMatches = 0;
    this.pageState.pendingMatches = 0;
  }

  private buildInitialState(): MatchesViewModel {
    return {
      lang: 'es',
      loading: false,
      errorMessage: '',
      showNoSimulationState: false,
      selectedStage: 'ALL',
      stages: [],
      totalMatches: 0,
      playedMatches: 0,
      pendingMatches: 0,
      matches: [],
    };
  }
}
