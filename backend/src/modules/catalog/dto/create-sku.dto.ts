import { IsString, IsOptional, IsInt, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkuDto {
  @ApiProperty({
    description: 'SKU code (unique within product)',
    example: 'HEADPHONE-BLACK-001',
  })
  @IsString()
  skuCode!: string;

  @ApiPropertyOptional({
    description: 'Variant attributes (color, size, etc.)',
    example: { color: 'Black', size: 'Standard' },
  })
  @IsObject()
  @IsOptional()
  variantJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Weight in grams',
    example: 250,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  weightGrams?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  lengthCm?: number;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 18,
  })
  @IsOptional()
  @Type(() => Number)
  widthCm?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  heightCm?: number;

  @ApiPropertyOptional({
    description: 'GTIN/EAN/UPC barcode',
    example: '7891234567890',
  })
  @IsString()
  @IsOptional()
  gtin?: string;
}
