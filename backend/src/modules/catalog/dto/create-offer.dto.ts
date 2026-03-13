import { IsString, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({
    description: 'SKU ID for this offer',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  skuId!: string;

  @ApiProperty({
    description: 'Cost price in cents',
    example: 5000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  costCents!: number;

  @ApiPropertyOptional({
    description: 'Manufacturer suggested retail price in cents',
    example: 12000,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  msrpCents?: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stockQty!: number;

  @ApiPropertyOptional({
    description: 'Service level agreement in days',
    example: 3,
    default: 2,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  slaDays?: number;

  @ApiPropertyOptional({
    description: 'Shipping origin location',
    example: 'São Paulo, SP',
  })
  @IsString()
  @IsOptional()
  shipsFrom?: string;

  @ApiPropertyOptional({
    description: 'Allow random color selection',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowRandomColor?: boolean;
}
