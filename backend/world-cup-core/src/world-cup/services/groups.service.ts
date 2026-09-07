import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupsService {

  // 👇 Le agregamos la 's' al final para que sea plural
  async getRawGroups() { 
    try {
      const urlAPIExterna = 'http://localhost:5101/worldCup/world-cup/current/groups';
      const response = await fetch(urlAPIExterna);
      
      if (!response.ok) {
        throw new Error(`Error en la API externa: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        message: 'No se pudo conectar con la WorldCupAPI',
        error: error.message
      };
    }
  }

  async getProcessedGroups() {
    try {
      // Dejamos la línea limpia como pide el Visual Code
      const rawData = await this.getRawGroups();

      if (!rawData) throw new Error('No se recibieron datos');

      // Le decimos que trate a rawData como 'any' recién acá adentro
      const dataReal: any = rawData;

      const gruposList = Array.isArray(dataReal) 
        ? dataReal 
        : (dataReal.groups || dataReal.data || []);

      const processed = gruposList.map((grupo: any) => {
        const teamsWithFlag = (grupo.teams || []).map((team: any) => ({
          ...team,
          isMyTeam: team.id?.toLowerCase() === 'aus' || team.code?.toLowerCase() === 'aus'
        }));

        return {
          groupName: grupo.name || grupo.group || 'Grupo',
          teams: teamsWithFlag
        };
      });

      return {
        myTeamCode: 'AUS',
        groups: processed
      };

    } catch (error: any) {
      return {
        message: 'Error al procesar la fase de grupos',
        error: error.message || String(error)
      };
    }
  }
}