import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NoGuestGuard } from '../auth/guards/guest.guard';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async findAll(@CurrentUser() user: { id: number }) {
    return this.rolesService.findByUserId(user.id);
  }

  @Post()
  @UseGuards(NoGuestGuard)
  async create(
    @CurrentUser() user: { id: number },
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.create(user.id, createRoleDto);
  }

  @Delete(':tipo')
  @UseGuards(NoGuestGuard)
  async delete(
    @CurrentUser() user: { id: number },
    @Param('tipo') tipo: string,
  ) {
    return this.rolesService.delete(user.id, tipo);
  }
}
