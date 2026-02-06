import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VehiclesService {
  private backendUrl: string;

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
  }

  private normalizeImageUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) return `${this.backendUrl}${url}`;
    return url;
  }

  async findByDriverProfileId(driverProfileId: number) {
    const result = await this.db.query(
      'SELECT * FROM vehicles WHERE driver_profile_id = $1',
      [driverProfileId],
    );

    if (result.rows.length === 0) {
      return {};
    }

    const vehicle = result.rows[0];
    return {
      ...vehicle,
      img_vehiculo: this.normalizeImageUrl(vehicle.img_vehiculo),
    };
  }
}
