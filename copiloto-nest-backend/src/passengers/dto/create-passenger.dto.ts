import { IsString, IsOptional } from 'class-validator';

export class CreatePassengerDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  @IsOptional()
  @IsString()
  barrio?: string;

  @IsOptional()
  @IsString()
  img?: string;
}
