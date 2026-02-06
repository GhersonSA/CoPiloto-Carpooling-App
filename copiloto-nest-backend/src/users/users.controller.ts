import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Solo admin puede ver todos los usuarios
  @Get()
  async findAll(@CurrentUser() user: any) {
    await this.checkAdmin(user.id);
    return this.usersService.findAll();
  }

  // Solo admin puede eliminar usuarios
  @Delete(':id')
  async delete(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.checkAdmin(user.id);
    return this.usersService.delete(id);
  }

  private async checkAdmin(userId: number) {
    const user = await this.usersService.findById(userId);
    if (user?.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede acceder');
    }
  }
}
