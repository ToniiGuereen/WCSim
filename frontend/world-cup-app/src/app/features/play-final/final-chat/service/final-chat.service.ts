import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { FinalChatApiResponse } from '../model/final-chat-api.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinalChatService {
  private readonly startUrl = `${environment.coreServiceUrl}/final-match/start`;
  private readonly playUrl = `${environment.coreServiceUrl}/final-match/play`;

  constructor(private http: HttpClient) {}

  startFinal() {
    return this.http
      .post<{ success: boolean; data: FinalChatApiResponse;}>(this.startUrl, {})
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error('Primero debe simularse el mundial.');
          }

          return response.data;
        })
      );
  }

  play(selectedOption: number) {
    return this.http
      .post<{ data: FinalChatApiResponse }>(this.playUrl, { selectedOption })
      .pipe(map((response) => response.data));
  }

  changeStrategy(strategy: string) {
  return this.http
    .post<{ data: FinalChatApiResponse }>(
      `${environment.coreServiceUrl}/final-match/strategy`,
      { strategy },
    )
    .pipe(map((response) => response.data));
  }

  changeFormation(formation: string) {
    return this.http
      .post<{ data: FinalChatApiResponse }>(
        `${environment.coreServiceUrl}/final-match/formation`,
        { formation },
      )
      .pipe(map((response) => response.data));
  }
}