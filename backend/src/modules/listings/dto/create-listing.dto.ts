import { IsString, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Provider } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({
    description: 'Supplier offer ID to create listing from',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  supplierOfferId!: string;

  @ApiProperty({
    description: 'Marketplace provider',
    enum: Provider,
    example: Provider.SHOPEE,
  })
  @IsEnum(Provider)
  provider!: Provider;

  @ApiProperty({
    description: 'Listing title for the marketplace',
    example: 'Fone de Ouvido Premium Sem Fio',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Selling price in cents',
    example: 15000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceCents!: number;
}
