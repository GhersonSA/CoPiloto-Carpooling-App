import { IsString, IsOptional } from 'class-validator';

export class CreateRoutePassengerDto {
  @IsString()
  origen: string;

  @IsString()
  destino: string;

  @IsString()
  dias: string;

  @IsString()
  hora_salida: string;

  @IsString()
  hora_llegada: string;

  @IsOptional()
  @IsString()
  hora_regreso?: string;

  @IsOptional()
  @IsString()
  hora_llegada_regreso?: string;
}
