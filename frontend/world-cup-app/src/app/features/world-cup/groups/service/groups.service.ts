import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  
  private apiUrl = 'http://localhost:4101/worldCupCore/world-cup/groups';

  constructor(private http: HttpClient) {}

  getFaseDeGrupos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}