import { Injectable } from '@nestjs/common';
import { WorldCupApiService } from '../../basic/world-cup-api.service';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class TeamStateService {

  constructor(
    private readonly worldCupApiService: WorldCupApiService,
    private readonly adminService: AdminService,
  ) {}

  private addEnergyLabel(players: any[]): any[] { // any: estructura dinamica de la WorldCupAPI
    return (players || []).map(p => ({
      ...p,
      energyLabel: p.energy > 70 ? 'Alto' : p.energy >= 40 ? 'Medio' : 'Bajo',
    }));
  }

  public async getTeamState(): Promise<any> { // any: respuesta dinamica de la WorldCupAPI
    try {
      const lang = this.adminService.getCurrentLang();
      const raw: any = await this.worldCupApiService.get('/match/current/squad', { lang }); // any: tipo generico del WorldCupApiService
      const response = raw.data;

      response.team.onField = this.addEnergyLabel(response.team.onField);
      response.team.bench = this.addEnergyLabel(response.team.bench);
      response.opponent.onField = this.addEnergyLabel(response.opponent.onField);
      response.opponent.bench = this.addEnergyLabel(response.opponent.bench);

      return response;

    } catch (error: any) {
      return {
        showNoFinalState: true,
        messageCode: 'WC_SQUAD_UNAVAILABLE',
        message: 'No hay una final activa',
      };
    }
  }
}