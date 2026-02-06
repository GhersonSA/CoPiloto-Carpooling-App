import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Get()
  async findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findByRoleId(id);
  }
}
