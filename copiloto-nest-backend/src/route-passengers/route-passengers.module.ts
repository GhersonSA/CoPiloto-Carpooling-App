import { Module } from '@nestjs/common';
import { RoutePassengersController } from './route-passengers.controller';
import { RoutePassengersService } from './route-passengers.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [RoutePassengersController],
  providers: [RoutePassengersService],
  exports: [RoutePassengersService],
})
export class RoutePassengersModule {}
