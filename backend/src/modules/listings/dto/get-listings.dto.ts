import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Provider } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetListingsDto {
  @ApiPropertyOptional({
    description: 'Filter by marketplace provider',
    enum: Provider,
    example: Provider.SHOPEE,
  })
  @IsOptional()
  @IsEnum(Provider)
  provider?: Provider;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search by title',
    example: 'Fone de Ouvido',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by sync status',
    example: 'SYNCED',
  })
  @IsOptional()
  @IsString()
  syncStatus?: string;
}
