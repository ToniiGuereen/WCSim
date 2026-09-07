// frontend/world-cup-app/src/app/features/my-team/rivals/service/rivals.service.ts
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { RivalsApiResponse } from '../model/rivals-api.interface';
import { RivalsViewModel } from '../model/rivals-view-model.interface';

@Injectable({ providedIn: 'root' })
export class RivalsService extends BaseApiService {

  private readonly pageState: RivalsViewModel = {
    rivals: [],
    totalRivals: 0,
    loading: false,
    errorMessage: '',
    lang: 'es',
    selectedTeamLabel: '',
  };

  private hasInitialized = false;

  getViewModel(): RivalsViewModel {
    return this.pageState;
  }

  initialize(): void {
    if (this.hasInitialized) {
      this.loadRivals().subscribe();
      return;
    }

    this.hasInitialized = true;
    this.pageState.lang = this.getCurrentLang();

    this.appContextService.currentTeamId$
      .pipe(switchMap(() => this.loadRivals()))
      .subscribe();
  }

  private loadRivals(): Observable<void> {
    this.pageState.loading = true;
    this.pageState.errorMessage = '';

    return this.get<RivalsApiResponse>('/my-team/rivals').pipe(
      map((response) => response.data),
      tap((payload) => {
        this.pageState.rivals = payload?.rivals ?? [];
        this.pageState.totalRivals = payload?.totalRivals ?? 0;
      }),
      map(() => undefined),
      catchError(() => {
        this.pageState.rivals = [];
        this.pageState.totalRivals = 0;
        this.pageState.errorMessage = 'No se pudieron cargar los rivales históricos. Intenta nuevamente.';
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }
}