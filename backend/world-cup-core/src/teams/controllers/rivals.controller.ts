// backend/world-cup-core/src/teams/controllers/rivals.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { RivalsService } from '../services/rivals.service';

@ApiTags('my-team')
@Controller('my-team')
export class RivalsController extends AbstractController {
  constructor(private readonly rivalsService: RivalsService) {
    super();
  }

  @Get('rivals')
  @ApiOperation({ summary: 'My Team - Rivals component' })
  public async getRivals(): Promise<unknown> {
    return this.createOkResponse(
      await this.rivalsService.getRivals(),
    );
  }
}