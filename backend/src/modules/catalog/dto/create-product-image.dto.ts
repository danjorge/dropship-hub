import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/images/headphone-main.jpg',
  })
  @IsString()
  url!: string;

  @ApiPropertyOptional({
    description: 'Sort order for image display',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
