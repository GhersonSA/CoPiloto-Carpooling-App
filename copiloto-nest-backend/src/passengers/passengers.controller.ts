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
import { PassengersService } from './passengers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoGuestGuard } from '../auth/guards/guest.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';

@Controller('passengers')
@UseGuards(JwtAuthGuard)
export class PassengersController {
  constructor(private passengersService: PassengersService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.passengersService.findByUserId(user.id);
  }

  @Post()
  @UseGuards(NoGuestGuard)
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreatePassengerDto,
  ) {
    return this.passengersService.create(user.id, createDto);
  }

  @Put(':id')
  @UseGuards(NoGuestGuard)
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePassengerDto,
  ) {
    return this.passengersService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(NoGuestGuard)
  async delete(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.passengersService.delete(id, user.id);
  }
}
