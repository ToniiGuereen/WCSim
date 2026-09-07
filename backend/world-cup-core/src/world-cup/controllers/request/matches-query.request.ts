import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LanguageEnum } from '../../../basic/model/language.enum';

export class MatchesQueryRequest {
  @ApiPropertyOptional({ enum: [LanguageEnum.ES, LanguageEnum.EN], default: LanguageEnum.ES })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEnum(LanguageEnum)
  lang?: LanguageEnum;

  @ApiPropertyOptional({ default: 'ALL' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  stage?: string;
}
