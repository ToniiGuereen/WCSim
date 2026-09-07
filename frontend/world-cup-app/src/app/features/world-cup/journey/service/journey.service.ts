import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  Observable,
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";

import { BaseApiService } from "../../../../core/services/base-api.service";
import { UiVisualsService } from "../../../../core/services/ui-visuals.service";
import { JourneyApiResponse } from "../model/journey-api.interface";
import { JourneyViewModel } from "../model/journey-view-model.interface";

@Injectable({ providedIn: "root" })
export class JourneyService extends BaseApiService {
  private readonly uiVisualsService = inject(UiVisualsService);

  private readonly pageState: JourneyViewModel = {
    lang: "es",
    loading: false,
    errorMessage: "",
    showNoSimulationState: false,
    selectedTeamLabel: "",
    journey: null,
  };

  private hasInitialized = false;

  getViewModel(): JourneyViewModel {
    return this.pageState;
  }

  initialize(): void {
    if (this.hasInitialized) {
      this.loadJourney().subscribe();
      return;
    }

    this.hasInitialized = true;
    this.pageState.lang = this.getCurrentLang();

    combineLatest([
      this.appContextService.currentTeamId$,
      this.appContextService.lang$,
      this.appContextService.worldCupRefresh$,
    ])
      .pipe(
        tap(([, lang]) => (this.pageState.lang = lang === "en" ? "en" : "es")),
        switchMap(() => this.loadJourney()),
      )
      .subscribe();
  }

  private loadJourney(): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = "";

    return this.get<JourneyApiResponse>("/world-cup/journey", { lang }).pipe(
      map((response) => response.data),
      map((journey) => this.normalizeJourney(journey)),
      tap((journey) => {
        this.pageState.journey = journey;
        this.pageState.selectedTeamLabel = journey?.teamName ?? "";
        this.pageState.showNoSimulationState = false;
      }),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.pageState.journey = null;
        this.pageState.selectedTeamLabel = "";

        if (this.isJourneyUnavailableError(error)) {
          this.pageState.showNoSimulationState = true;
          this.pageState.errorMessage = "";
          return of(undefined);
        }

        this.pageState.showNoSimulationState = false;
        this.pageState.errorMessage = "No se pudo cargar el camino del equipo.";
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }
  private normalizeJourney(
    journey: JourneyApiResponse | null | undefined,
  ): JourneyApiResponse | null {
    if (!journey) {
      return null;
    }

    return {
      ...journey,
      matches: (journey.matches ?? []).map((match) => ({
        ...match,
        opponentFlag: this.uiVisualsService.getTeamFlag(match.opponentTeamId),
      })),
    };
  }

  private isJourneyUnavailableError(error: HttpErrorResponse): boolean {
    const messageCode = (
      error?.error as { responseMessage?: { messageCode?: string } } | undefined
    )?.responseMessage?.messageCode;

    return messageCode === "WC_JOURNEY_UNAVAILABLE";
  }
}
