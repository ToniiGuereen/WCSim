import { Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { WorldCupApiService } from '../../basic/world-cup-api.service';

@Injectable()
export class PlayFinalService {
  /** Drives the final-match lifecycle against the World Cup API using the active admin team/lang context. */
  constructor(
    private readonly worldCupApiService: WorldCupApiService,
    private readonly adminService: AdminService,
  ) {}

  async startFinal() {
    const teamId = this.adminService.getCurrentTeamId();
    const lang = this.adminService.getCurrentLang();

    return this.worldCupApiService.post('/match/start-final', {
      teamId,
      lang,
    });
  }

  async play(selectedOption: number) {
    const lang = this.adminService.getCurrentLang();

    return this.worldCupApiService.post('/match/play', {
      selectedOption,
      lang,
    });
  }

  async changeStrategy(strategy: string) {
    const teamId = this.adminService.getCurrentTeamId();
    const lang = this.adminService.getCurrentLang();

    return this.worldCupApiService.post('/match/select-strategy', {
      teamId,
      strategy,
      lang,
    });
  }

  async changeFormation(formation: string) {
    const teamId = this.adminService.getCurrentTeamId();
    const lang = this.adminService.getCurrentLang();

    return this.worldCupApiService.post('/match/select-formation', {
      teamId,
      formation,
      lang,
    });
  }
}
