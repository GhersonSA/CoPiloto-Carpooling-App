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
import { RoutePassengersService } from './route-passengers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateRoutePassengerDto } from './dto/create-route-passenger.dto';
import { UpdateRoutePassengerDto } from './dto/update-route-passenger.dto';

@Controller('route-passengers')
export class RoutePassengersController {
  constructor(private routePassengersService: RoutePassengersService) {}

  // PÚBLICO: Devuelve todas las rutas de pasajeros (para el mapa)
  @Get()
  async findAll() {
    return this.routePassengersService.findAll();
  }

  // PROTEGIDO: Devuelve las rutas del usuario actual
  @Get('mis-rutas')
  @UseGuards(JwtAuthGuard)
  async findMyRoutes(@CurrentUser() user: { id: number }) {
    return this.routePassengersService.findMyRoutes(user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routePassengersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async create(
    @CurrentUser() user: { id: number },
    @Body() createDto: CreateRoutePassengerDto,
  ) {
    return this.routePassengersService.create(user.id, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRoutePassengerDto,
  ) {
    return this.routePassengersService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async deleteOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.routePassengersService.deleteById(id, user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, NoGuestGuard)
  async deleteAll(@CurrentUser() user: { id: number }) {
    return this.routePassengersService.deleteAllByUserId(user.id);
  }
}
