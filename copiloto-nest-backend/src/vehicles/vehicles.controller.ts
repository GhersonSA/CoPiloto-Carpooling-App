import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get('by-profile/:driver_profile_id')
  async findByDriverProfile(
    @Param('driver_profile_id', ParseIntPipe) driverProfileId: number,
  ) {
    return this.vehiclesService.findByDriverProfileId(driverProfileId);
  }
}
