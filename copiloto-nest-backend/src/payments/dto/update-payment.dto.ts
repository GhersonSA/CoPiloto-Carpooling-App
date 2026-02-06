import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsNumber()
  pago?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
