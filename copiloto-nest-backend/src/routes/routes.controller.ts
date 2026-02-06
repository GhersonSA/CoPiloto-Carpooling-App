import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NoGuestGuard } from '../auth/guards/guest.guard';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  // PÚBLICO: Todas las rutas (para el mapa)
  @Get()
  async findAll() {
    return this.routesService.findAll();
  }

  // PROTEGIDO: Solo las rutas del usuario actual (para "Mis Viajes")
  @Get('mis-rutas')
  @UseGuards(JwtAuthGuard)
  async findMyRoutes(@CurrentUser() user: { id: number }) {
    return this.routesService.findByUserId(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async create(@CurrentUser() user: { id: number }, @Body() createDto: CreateRouteDto) {
    return this.routesService.create(user.id, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async delete(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.routesService.delete(id, user.id);
  }
}
