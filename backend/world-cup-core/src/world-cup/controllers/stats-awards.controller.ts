import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { StatsAwardsService } from '../services/stats-awards.service';

@ApiTags('world-cup')
@Controller('world-cup')
export class StatsAwardsController extends AbstractController {
  constructor(private readonly statsAwardsService: StatsAwardsService) {
    super();
  }

  
  @Get('stats-awards')
  @ApiOperation({ summary: 'El Mundial - Estadísticas y Premios' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  public async getStatsAndAwards(@Query('lang') lang?: string): Promise<unknown> {
    return this.createOkResponse(
      await this.statsAwardsService.getStatsAndAwards(lang),
    );
  }
}
