import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  pasajero_id: number;

  @IsOptional()
  @IsNumber()
  chofer_id?: number;

  @IsOptional()
  @IsNumber()
  ruta_id?: number;

  @IsString()
  fecha: string;

  @IsNumber()
  pago: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
