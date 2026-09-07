import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { MatchesService } from '../services/matches.service';
import { MatchesQueryRequest } from './request/matches-query.request';

@ApiTags('world-cup')
@Controller('world-cup')
export class MatchesController extends AbstractController {
  constructor(private readonly matchesService: MatchesService) {
    super();
  }

  @Get('matches')
  @ApiOperation({ summary: 'World Cup - Match details component' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  @ApiQuery({ name: 'stage', required: false })
  public async getMatches(@Query() request: MatchesQueryRequest): Promise<unknown> {
    return this.createOkResponse(
      await this.matchesService.getMatches(request.lang, request.stage),
    );
  }
}
