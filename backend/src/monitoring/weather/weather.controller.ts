import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class UpdateWeatherDto {
  @IsString()
  localConditions: string;
}

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getLatest() {
    return this.weatherService.getLatest();
  }

  /** UC27 — AirportAdministrator triggers weather update */
  @UseGuards(JwtAuthGuard)
  @Post()
  update(@Body() dto: UpdateWeatherDto) {
    return this.weatherService.update(dto.localConditions);
  }
}
