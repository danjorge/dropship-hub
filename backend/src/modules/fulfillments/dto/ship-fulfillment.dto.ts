import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShipFulfillmentDto {
  @ApiProperty({
    description: 'Tracking code for the shipment',
    example: 'BR123456789SP',
  })
  @IsString()
  trackingCode!: string;

  @ApiProperty({
    description: 'Carrier/shipping company name',
    example: 'Correios',
  })
  @IsString()
  carrier!: string;
}
