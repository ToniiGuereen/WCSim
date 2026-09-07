import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../services/groups.service';

@ApiTags('world-cup')
@Controller('world-cup') // 👈 Dejalo así, igual al resto de tus controladores
export class GroupsController {

  constructor(private readonly groupsService: GroupsService) {}

  @Get('groups') // 👈 Mantenemos la subruta 'groups'
  async getGroupsData(@Res() response: any) {
    try {
      // Llamamos al servicio con la lógica de Australia
      const data = await this.groupsService.getProcessedGroups();
      
      // Devolvemos la respuesta nativa sin dar vueltas
      return response.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error en el controlador al obtener grupos',
        error: error.message
      });
    }
  }
}