import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RatingsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query('SELECT * FROM ratings');
    return result.rows;
  }
}
