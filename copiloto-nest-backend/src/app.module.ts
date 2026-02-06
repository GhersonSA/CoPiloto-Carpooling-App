import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { DriversModule } from './drivers/drivers.module';
import { PassengersModule } from './passengers/passengers.module';
import { PaymentsModule } from './payments/payments.module';
import { RoutesModule } from './routes/routes.module';
import { RoutePassengersModule } from './route-passengers/route-passengers.module';
import { RatingsModule } from './ratings/ratings.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    DriversModule,
    PassengersModule,
    PaymentsModule,
    RoutesModule,
    RoutePassengersModule,
    RatingsModule,
    VehiclesModule,
    UploadModule,
  ],
})
export class AppModule {}
