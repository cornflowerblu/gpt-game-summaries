import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthConfig } from './config/health';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService<HealthConfig>) {}
  async getHealth(): Promise<Record<string, unknown>> {
    return {
      status: HttpStatus.OK,
      message: `${this.configService.get(
        'environment',
      )} server is running' at ${new Date().toISOString()}`,
    };
  }
}
