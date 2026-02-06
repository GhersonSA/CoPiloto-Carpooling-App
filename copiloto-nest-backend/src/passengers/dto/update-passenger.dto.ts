import { IsString, IsOptional } from 'class-validator';

export class UpdatePassengerDto {
  @IsOptional()
  @IsString()
  nombre?: string;

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
