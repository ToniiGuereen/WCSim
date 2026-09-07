import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
@Injectable({ providedIn: "root" })
export class LiveEventsService {
  private baseUrl = "http://localhost:4101/worldCupcore/final-match";

  constructor(private http: HttpClient) {}

  obtenerEventosGeniales(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/eventos-geniales-api`);
  }
}
