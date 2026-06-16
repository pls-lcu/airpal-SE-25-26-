import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SchedulingEngineStub } from '../../common/stubs/scheduling-engine.stub';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightType, ScheduleStatus } from '../../generated/prisma/enums';

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulingEngine: SchedulingEngineStub,
  ) {}

  // ─────────────────────────────────────────
  // UC18 — Submit flight schedule (airline manager)
  // Skipped for this project — external actor use case
  // ─────────────────────────────────────────

  async submitSchedule(_dto: CreateFlightDto, _airlineManagerId: number) {
    throw new Error('Not implemented — airline manager use cases are out of scope');
  }

  // ─────────────────────────────────────────
  // UC06 — Search available flights
  //
  // All query params are optional, so:
  //   GET /api/flights             → returns all passenger flights
  //   GET /api/flights?origin=MXP  → filter by origin
  //   GET /api/flights?origin=MXP&destination=FCO&date=2026-06-17
  // ─────────────────────────────────────────

  async search(origin?: string, destination?: string, date?: string) {
    // Build the WHERE clause step by step — add conditions only when the param was provided
    const where: any = {
      type: FlightType.PASSENGER,         // only show passenger flights
      schedule: {
        status: { not: ScheduleStatus.CANCELLED }, // hide cancelled flights
      },
    };

    if (origin) {
      // Airports use IATA codes (e.g. "MXP") — normalize to uppercase so the search
      // works even if the user types lowercase ("mxp")
      where.origin = origin.toUpperCase();
    }

    if (destination) {
      where.destination = destination.toUpperCase();
    }

    if (date) {
      // Filter by full calendar day in UTC.
      // The user passes a date string like "2026-06-17".
      // We turn it into a [start, end] range covering the whole day.
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.departureTime = { gte: start, lte: end };
    }

    return this.prisma.flight.findMany({
      where,
      include: {
        schedule: true,   // include ON_TIME / DELAYED status
        gate: true,       // include gate number and terminal
        aircraft: true,   // include tail number
      },
      orderBy: { departureTime: 'asc' }, // earliest flights first
    });
  }

  // ─────────────────────────────────────────
  // UC10 — Find the departure gate for a flight
  //
  //   GET /api/flights/:flightNo/gate
  // ─────────────────────────────────────────

  async findGate(flightNo: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightNo: flightNo.toUpperCase() },
      include: { gate: true },
    });

    if (!flight) {
      throw new NotFoundException(`Flight ${flightNo} not found`);
    }

    if (!flight.gate) {
      throw new NotFoundException(`No gate assigned to flight ${flightNo} yet`);
    }

    return {
      flightNo: flight.flightNo,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      gate: flight.gate,
    };
  }

  // ─────────────────────────────────────────
  // UC11 — Find the baggage carousel for an arriving flight
  //
  //   GET /api/flights/:flightNo/carousel
  // ─────────────────────────────────────────

  async findCarousel(flightNo: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightNo: flightNo.toUpperCase() },
      include: { gate: true },
    });

    if (!flight) {
      throw new NotFoundException(`Flight ${flightNo} not found`);
    }

    if (!flight.gate || !flight.gate.carousel) {
      throw new NotFoundException(`No baggage carousel assigned to flight ${flightNo} yet`);
    }

    return {
      flightNo: flight.flightNo,
      origin: flight.origin,
      destination: flight.destination,
      arrivalTime: flight.arrivalTime,
      carousel: flight.gate.carousel,
      terminal: flight.gate.terminal,
    };
  }
}
