import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
