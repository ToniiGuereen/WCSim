import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamStateApiResponse } from '../model/team-state-api.interface';
import { TeamStateViewModel } from '../model/team-state-view-model.interface';

@Injectable({ providedIn: 'root' })
export class TeamStateService {

  private readonly baseUrl = 'http://localhost:4101/worldCupCore';

  constructor(private readonly http: HttpClient) {}

  getTeamState(): Observable<TeamStateViewModel> {
    return this.http.get<any>(`${this.baseUrl}/final-match/team-state`).pipe(
      map(res => {
        if (res.showNoFinalState) {
          return {
            lang: 'es',
            loading: false,
            errorMessage: '',
            showNoFinalState: true,
            data: null,
          } as TeamStateViewModel;
        }
        return {
          lang: 'es',
          loading: false,
          errorMessage: '',
          showNoFinalState: false,
          data: res as TeamStateApiResponse,
        } as TeamStateViewModel;
      })
    );
  }
}