import { Module } from '@nestjs/common';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';
import { WeatherController } from './weather/weather.controller';
import { WeatherService } from './weather/weather.service';
import { WeatherApiStub } from '../common/stubs/weather-api.stub';

@Module({
  controllers: [ReportsController, WeatherController],
  providers: [ReportsService, WeatherService, WeatherApiStub],
})
export class MonitoringModule {}
