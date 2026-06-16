import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WeatherApiStub } from '../../common/stubs/weather-api.stub';

@Injectable()
export class WeatherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherApi: WeatherApiStub,
  ) {}

  /** UC27 — Fetch and persist latest weather data from both sources */
  async update(localConditions: string) {
    const regionalConditions = await this.weatherApi.fetchRegionalConditions();
    return this.prisma.weatherData.create({ data: { localConditions, regionalConditions } });
  }

  getLatest() {
    return this.prisma.weatherData.findFirst({ orderBy: { updatedAt: 'desc' } });
  }
}
