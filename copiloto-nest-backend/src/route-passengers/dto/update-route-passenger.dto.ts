import { IsString, IsOptional } from 'class-validator';

export class UpdateRoutePassengerDto {
  @IsOptional()
  @IsString()
  origen?: string;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsString()
  dias?: string;

  @IsOptional()
  @IsString()
  hora_salida?: string;

  @IsOptional()
  @IsString()
  hora_llegada?: string;

  @IsOptional()
  @IsString()
  hora_regreso?: string;

  @IsOptional()
  @IsString()
  hora_llegada_regreso?: string;
}
