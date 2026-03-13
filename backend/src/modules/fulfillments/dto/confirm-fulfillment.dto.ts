import { IsOptional, IsString } from 'class-validator';

export class ConfirmFulfillmentDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
