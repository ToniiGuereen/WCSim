import { Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { WorldCupApiService } from '../../basic/world-cup-api.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly worldCupApiService: WorldCupApiService,
    private readonly adminService: AdminService,
  ) {}

  async getRawGroups() {
    try {
      return await this.worldCupApiService.get('/world-cup/current/groups');
    } catch (error: any) {
      return {
        message: 'No se pudo conectar con la WorldCupAPI',
        error: error.message,
      };
    }
  }

  async getProcessedGroups() {
    try {
      const rawData = await this.getRawGroups();

      if (!rawData) throw new Error('No se recibieron datos');

      const dataReal: any = rawData;
      const teamId = this.adminService.getCurrentTeamId().toLowerCase();

      const gruposList = Array.isArray(dataReal)
        ? dataReal
        : dataReal.groups || dataReal.data || [];

      const processed = gruposList.map((grupo: any) => {
        const teamsWithFlag = (grupo.teams || []).map((team: any) => ({
          ...team,
          isMyTeam:
            team.teamId?.toLowerCase() === teamId ||
            team.id?.toLowerCase() === teamId ||
            team.code?.toLowerCase() === teamId,
        }));

        return {
          groupName: grupo.name || grupo.group || 'Grupo',
          teams: teamsWithFlag,
        };
      });

      return {
        myTeamCode: teamId.toUpperCase(),
        groups: processed,
      };
    } catch (error: any) {
      return {
        message: 'Error al procesar la fase de grupos',
        error: error.message || String(error),
      };
    }
  }
}
