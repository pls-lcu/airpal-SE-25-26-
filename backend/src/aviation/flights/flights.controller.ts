import { Controller, Get, Param, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  // UC06 — Search flights
  // All query params are optional. Examples:
  //   GET /api/flights
  //   GET /api/flights?origin=MXP&destination=FCO
  //   GET /api/flights?origin=MXP&destination=FCO&date=2026-06-17
  @Get()
  search(
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
    @Query('date') date?: string,
  ) {
    return this.flightsService.search(origin, destination, date);
  }

  // UC10 — Gate finder
  //   GET /api/flights/:flightNo/gate
  @Get(':flightNo/gate')
  findGate(@Param('flightNo') flightNo: string) {
    return this.flightsService.findGate(flightNo);
  }

  // UC11 — Baggage carousel finder
  //   GET /api/flights/:flightNo/carousel
  @Get(':flightNo/carousel')
  findCarousel(@Param('flightNo') flightNo: string) {
    return this.flightsService.findCarousel(flightNo);
  }
}
