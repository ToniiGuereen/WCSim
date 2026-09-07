import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TeamStateService } from '../services/team-state.service';

@ApiTags('final-match')
@Controller('final-match')
export class TeamStateController {

  constructor(
    private readonly teamStateService: TeamStateService,
  ) {}

  @ApiOperation({ summary: 'Obtiene el estado actual del plantel de ambos equipos en la final' })
  @Get('team-state')
  public async getTeamState() {
    return await this.teamStateService.getTeamState();
  }
}