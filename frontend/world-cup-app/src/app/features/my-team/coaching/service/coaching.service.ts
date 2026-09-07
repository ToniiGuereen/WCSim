import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { CoachingViewModel } from '../model/coaching-view-model.interface';
import { CoachingOverviewData } from '../model/coaching-api.interface';

@Injectable({ providedIn: 'root' })
export class CoachingService extends BaseApiService {
  private readonly pageState: CoachingViewModel = {
    lang: 'es',
    loading: false,
    savingStrategy: false,
    savingFormation: false,
    savingResetDefault: false,
    errorMessage: '',
    selectedTeamLabel: '',
    coach: null,
    strategy: null,
    formation: null,
    stats: null,
    strategies: [],
    formations: [],
    selectedStrategy: '',
    selectedFormation: '',
    selectedStrategyDescription: '',
    compatibleFormations: [],
    compatibleStrategies: [],
    baseRatings: [],
    effectiveRatings: [],
    ratingDeltas: [],
    strategyPenalty: 0,
    isSelectedFormationCompatible: true,
    tacticalStatusTone: 'original',
    tacticalStatusLabelKey: '',
  };

  getViewModel(): CoachingViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.loadCoachingData().subscribe();
  }

  updateStrategy(strategy: string): void {
    if (!strategy || strategy === this.pageState.selectedStrategy) {
      return;
    }

    this.pageState.selectedStrategy = strategy;
    this.pageState.savingStrategy = true;
    this.pageState.errorMessage = '';

    this.post<void>('/my-team/coaching/strategy', { strategy })
      .pipe(
        switchMap(() => this.loadCoachingData()),
        catchError(() => {
          this.pageState.errorMessage = 'No se pudo actualizar la estrategia.';
          return of(undefined);
        }),
        finalize(() => {
          this.pageState.savingStrategy = false;
        }),
      )
      .subscribe();
  }

  updateFormation(formation: string): void {
    if (!formation || formation === this.pageState.selectedFormation) {
      return;
    }

    this.pageState.selectedFormation = formation;
    this.pageState.savingFormation = true;
    this.pageState.errorMessage = '';

    this.post<void>('/my-team/coaching/formation', { formation })
      .pipe(
        switchMap(() => this.loadCoachingData()),
        catchError(() => {
          this.pageState.errorMessage = 'No se pudo actualizar la formación.';
          return of(undefined);
        }),
        finalize(() => {
          this.pageState.savingFormation = false;
        }),
      )
      .subscribe();
  }

  resetTactics(): void {
    this.pageState.savingResetDefault = true;
    this.pageState.errorMessage = '';

    this.post<void>('/my-team/coaching/reset', {})
      .pipe(
        switchMap(() => this.loadCoachingData()),
        catchError(() => {
          this.pageState.errorMessage = 'No se pudo restaurar la táctica por defecto.';
          return of(undefined);
        }),
        finalize(() => {
          this.pageState.savingResetDefault = false;
        }),
      )
      .subscribe();
  }

  private loadCoachingData(): Observable<void> {
    const lang = this.getCurrentLang();

    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';

    return this.get<CoachingOverviewData>('/my-team/coaching', { lang }).pipe(
      map((response) => response.data),
      tap((payload) => {
        this.pageState.coach = payload.coach;
        this.pageState.strategy = payload.strategy;
        this.pageState.formation = payload.formation;
        this.pageState.stats = payload.stats;
        this.pageState.strategies = payload.strategies ?? [];
        this.pageState.formations = payload.formations ?? [];
        this.pageState.baseRatings = payload.baseRatings ?? [];
        this.pageState.effectiveRatings = payload.effectiveRatings ?? [];
        this.pageState.ratingDeltas = payload.ratingDeltas ?? [];
        this.pageState.strategyPenalty = payload.strategyPenalty ?? 0;

        this.pageState.selectedTeamLabel = payload.coach?.teamName ?? payload.teamId;

        this.pageState.selectedStrategy =
          payload.strategy?.strategy ?? payload.stats?.current_strategy ?? '';

        this.pageState.selectedFormation =
          payload.formation?.formation ?? payload.stats?.current_formation ?? '';

        this.pageState.selectedStrategyDescription =
          this.pageState.strategies.find(
            (strategy) => strategy.strategy === this.pageState.selectedStrategy,
          )?.description ?? '';

        this.pageState.compatibleFormations =
          payload.compatibility?.compatibleFormations ?? [];

        this.pageState.compatibleStrategies =
          payload.compatibility?.compatibleStrategies ?? [];

        this.pageState.isSelectedFormationCompatible =
          payload.compatibility?.isSelectedPairCompatible ?? true;

        this.pageState.tacticalStatusTone = this.pageState.isSelectedFormationCompatible
          ? 'compatible'
          : 'incompatible';

        this.pageState.tacticalStatusLabelKey = this.pageState.isSelectedFormationCompatible
          ? 'Combinación táctica compatible'
          : 'Combinación no recomendada';
      }),
      map(() => undefined),
      catchError(() => {
        this.pageState.coach = null;
        this.pageState.strategy = null;
        this.pageState.formation = null;
        this.pageState.stats = null;
        this.pageState.strategies = [];
        this.pageState.formations = [];
        this.pageState.baseRatings = [];
        this.pageState.effectiveRatings = [];
        this.pageState.ratingDeltas = [];
        this.pageState.errorMessage = 'No se pudo cargar la información del cuerpo técnico.';
        return of(undefined);
      }),
      finalize(() => {
        this.pageState.loading = false;
      }),
    );
  }
}