import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { WorldCupHistoryService } from '../services/world-cup-history.service';
import { CurrentWorldCupQueryRequest } from './request/current-world-cup-query.request';

@ApiTags('world-cup')
@Controller('world-cup')
export class WorldCupHistoryController extends AbstractController {
  constructor(private readonly worldCupHistoryService: WorldCupHistoryService) {
    super();
  }

  @Get('history')
  @ApiOperation({ summary: 'World Cup - Historial de Mundiales' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  public async getHistory(
    @Query() request: CurrentWorldCupQueryRequest,
  ): Promise<unknown> {
    return this.createOkResponse(
      await this.worldCupHistoryService.getHistory(request.lang),
    );
  }
}
