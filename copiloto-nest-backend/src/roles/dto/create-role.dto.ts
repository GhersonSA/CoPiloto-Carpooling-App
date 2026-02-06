import { IsString, IsObject } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  tipo: string;

  @IsObject()
  data: Record<string, any>;
}
