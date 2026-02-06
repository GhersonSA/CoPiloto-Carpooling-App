import { Module } from '@nestjs/common';
import { PassengersController } from './passengers.controller';
import { PassengerProfilesController } from './passenger-profiles.controller';
import { PassengersService } from './passengers.service';
import { PassengerProfilesService } from './passenger-profile.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PassengersController, PassengerProfilesController],
  providers: [PassengersService, PassengerProfilesService],
  exports: [PassengersService, PassengerProfilesService],
})
export class PassengersModule {}