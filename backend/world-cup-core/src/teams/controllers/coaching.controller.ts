import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AbstractController } from '../../basic/abstract.controller';
import { CoachingService } from '../services/coaching.service';

class UpdateCoachingStrategyRequestDto {
  @ApiProperty({
    example: 'ATTACK',
    description: 'Selected strategy to apply to the current team.',
  })
  @IsString()
  @IsNotEmpty()
  strategy: string;
}

class UpdateCoachingFormationRequestDto {
  @ApiProperty({
    example: '4-3-3',
    description: 'Selected formation to apply to the current team.',
  })
  @IsString()
  @IsNotEmpty()
  formation: string;
}

@ApiTags('my-team')
@Controller('my-team')
export class CoachingController extends AbstractController {
  constructor(private readonly coachingService: CoachingService) {
    super();
  }

  @Get('coaching')
  @ApiOperation({ summary: 'My Team - Coaching and strategy component' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  public async getCoaching(@Query('lang') lang?: string): Promise<unknown> {
    return this.createOkResponse(
      await this.coachingService.getCoachingOverview(lang),
    );
  }

  @Post('coaching/strategy')
  @ApiOperation({ summary: 'Update selected team strategy' })
  @ApiBody({ type: UpdateCoachingStrategyRequestDto })
  public async updateStrategy(
    @Body() request: UpdateCoachingStrategyRequestDto,
  ): Promise<unknown> {
    return this.createOkResponse(
      await this.coachingService.updateStrategy(request.strategy),
    );
  }

  @Post('coaching/formation')
  @ApiOperation({ summary: 'Update selected team formation' })
  @ApiBody({ type: UpdateCoachingFormationRequestDto })
  public async updateFormation(
    @Body() request: UpdateCoachingFormationRequestDto,
  ): Promise<unknown> {
    return this.createOkResponse(
      await this.coachingService.updateFormation(request.formation),
    );
  }

  @Post('coaching/reset')
  @ApiOperation({ summary: 'Reset selected team tactics to default values' })
  public async resetTactics(): Promise<unknown> {
    return this.createOkResponse(await this.coachingService.resetTactics());
  }
}