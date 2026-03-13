import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayOrderDto {
  @ApiProperty({ description: 'Order ID to pay' })
  @IsNotEmpty()
  orderId: string;
}
