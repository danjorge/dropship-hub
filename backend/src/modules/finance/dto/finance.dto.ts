import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePixPaymentDto {
  @ApiProperty({ example: 10000, description: 'Amount in cents (R$ 100.00 = 10000)' })
  @IsInt()
  @Min(100)
  amountCents: number;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  payerName: string;

  @ApiProperty({ example: '12345678900', description: 'CPF or CNPJ' })
  @IsString()
  @IsNotEmpty()
  payerDocument: string;
}

export class ConfirmPixPaymentDto {
  // Empty for now - in production would have webhook signature validation
}
