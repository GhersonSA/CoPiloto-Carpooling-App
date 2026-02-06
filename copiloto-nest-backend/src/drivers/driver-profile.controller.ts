import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('driver-profiles')
export class DriverProfilesController {
  constructor(private driversService: DriversService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findByRoleId(id);
  }
}
