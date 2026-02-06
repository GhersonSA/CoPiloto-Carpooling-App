import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriverProfilesController } from './driver-profile.controller';
import { DriversService } from './drivers.service';

@Module({
  controllers: [DriversController, DriverProfilesController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
