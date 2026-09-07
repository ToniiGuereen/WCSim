import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { WorldCupStatsApiResponse } from '../model/world-cup-stats-api.interface';
import { WorldCupStatsViewModel } from '../model/world-cup-stats-view-model.interface';

@Injectable({ providedIn: 'root' })
export class WorldCupStatsService extends BaseApiService {

  
  private readonly pageState: WorldCupStatsViewModel = {
    lang: 'es',
    loading: false,
    errorMessage: '',
    showNoDataState: false,
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

 
  getViewModel(): WorldCupStatsViewModel {
    return this.pageState;
  }

  
  initialize(): void {
    this.loadStats().subscribe();
  }

 
  private loadStats(): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';
    this.pageState.showNoDataState = false;

    return this.get<WorldCupStatsApiResponse>('/world-cup/stats-awards', { lang }).pipe(

      
      map((response) => response.data),

      tap((payload) => {
        
        if (!payload?.worldCupEnded) {
          this.pageState.showNoDataState = true;
          return;
        }

        
        this.pageState.showNoDataState = false;
        this.pageState.totalMatches = payload.totalMatches ?? 0;
        this.pageState.totalGoals = payload.totalGoals ?? 0;
        this.pageState.avgGoalsPerMatch = payload.avgGoalsPerMatch ?? 0;
        this.pageState.totalYellowCards = payload.totalYellowCards ?? 0;
        this.pageState.totalRedCards = payload.totalRedCards ?? 0;
        this.pageState.podium = payload.podium ?? [];
        this.pageState.topScorers = payload.topScorers ?? [];
        this.pageState.topAssists = payload.topAssists ?? [];
        this.pageState.awards = payload.awards ?? [];
      }),

      map(() => undefined),

      catchError(() => {
        
        this.pageState.errorMessage = 'No se pudieron cargar las estadísticas. Intentá nuevamente.';
        this.pageState.showNoDataState = false;
        return of(undefined);
      }),

      finalize(() => (this.pageState.loading = false)),
    );
  }
}
