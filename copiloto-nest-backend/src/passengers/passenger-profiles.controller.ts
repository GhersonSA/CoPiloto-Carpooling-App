import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PassengerProfilesService } from './passenger-profile.service';

@Controller('passenger-profiles')
export class PassengerProfilesController {
  constructor(private passengerProfilesService: PassengerProfilesService) {}

  @Get()
  async findAll() {
    return this.passengerProfilesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.passengerProfilesService.findByRoleId(id);
  }
}
