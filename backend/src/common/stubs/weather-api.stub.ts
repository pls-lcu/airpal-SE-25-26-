import { Injectable, Logger } from '@nestjs/common';

export interface WeatherSnapshot {
  localConditions: string;
  regionalConditions: string;
}

@Injectable()
export class WeatherApiStub {
  private readonly logger = new Logger(WeatherApiStub.name);

  async fetchRegionalConditions(): Promise<string> {
    this.logger.log('[STUB] WeatherAPI: fetching regional conditions');
    return 'Clear skies, 18°C, wind 12 km/h NW';
  }
}
