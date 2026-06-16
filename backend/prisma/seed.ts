// prisma/seed.ts
// Pre-loads sample flights, aircraft, and gates into the database.
// Run from inside the backend/ folder with:  npx ts-node prisma/seed.ts
// Safe to run multiple times — upsert won't create duplicates.

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { FlightType, ScheduleStatus } from '../src/generated/prisma/enums';

async function main() {
  // Set up the database connection the same way the app does (adapter-pg for Prisma 7)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  console.log('Seeding the database...\n');

  // ─────────────────────────────────────────
  // Aircraft
  // ─────────────────────────────────────────

  const plane1 = await prisma.aircraft.upsert({
    where: { tailNumber: 'IT-A320-01' },
    update: {},
    create: { tailNumber: 'IT-A320-01', status: 'available' },
  });

  const plane2 = await prisma.aircraft.upsert({
    where: { tailNumber: 'IT-B737-02' },
    update: {},
    create: { tailNumber: 'IT-B737-02', status: 'available' },
  });

  console.log('✓ Aircraft seeded');

  // ─────────────────────────────────────────
  // Gates
  // ─────────────────────────────────────────

  const gateA1 = await prisma.gate.upsert({
    where: { gateID: 'A1' },
    update: { carousel: 'C1' },
    create: { gateID: 'A1', terminal: 'Terminal 1', carousel: 'C1' },
  });

  const gateB3 = await prisma.gate.upsert({
    where: { gateID: 'B3' },
    update: { carousel: 'C3' },
    create: { gateID: 'B3', terminal: 'Terminal 2', carousel: 'C3' },
  });

  const gateC7 = await prisma.gate.upsert({
    where: { gateID: 'C7' },
    update: { carousel: 'C7' },
    create: { gateID: 'C7', terminal: 'Terminal 3', carousel: 'C7' },
  });

  console.log('✓ Gates seeded');

  // ─────────────────────────────────────────
  // Flights
  // Each flight also creates a linked Schedule row (1-to-1, status ON_TIME by default).
  // ─────────────────────────────────────────

  const flights = [
    {
      flightNo: 'AP101',
      origin: 'MXP',
      destination: 'FCO',
      departureTime: new Date('2026-06-17T08:00:00Z'),
      arrivalTime: new Date('2026-06-17T09:10:00Z'),
      aircraftId: plane1.id,
      gateId: gateA1.id,
    },
    {
      flightNo: 'AP102',
      origin: 'FCO',
      destination: 'MXP',
      departureTime: new Date('2026-06-17T15:30:00Z'),
      arrivalTime: new Date('2026-06-17T16:40:00Z'),
      aircraftId: plane2.id,
      gateId: gateB3.id,
    },
    {
      flightNo: 'AP201',
      origin: 'MXP',
      destination: 'LHR',
      departureTime: new Date('2026-06-18T10:00:00Z'),
      arrivalTime: new Date('2026-06-18T12:00:00Z'),
      aircraftId: plane1.id,
      gateId: gateC7.id,
    },
    {
      flightNo: 'AP202',
      origin: 'LHR',
      destination: 'MXP',
      departureTime: new Date('2026-06-19T14:00:00Z'),
      arrivalTime: new Date('2026-06-19T16:00:00Z'),
      aircraftId: plane2.id,
      gateId: gateA1.id,
    },
    {
      flightNo: 'AP301',
      origin: 'FCO',
      destination: 'JFK',
      departureTime: new Date('2026-06-20T09:00:00Z'),
      arrivalTime: new Date('2026-06-20T17:00:00Z'),
      aircraftId: plane1.id,
      gateId: gateB3.id,
    },
    {
      flightNo: 'AP302',
      origin: 'JFK',
      destination: 'FCO',
      departureTime: new Date('2026-06-21T11:00:00Z'),
      arrivalTime: new Date('2026-06-21T23:30:00Z'),
      aircraftId: plane2.id,
      gateId: gateC7.id,
    },
  ];

  for (const f of flights) {
    // upsert so we can re-run the seed without errors
    await prisma.flight.upsert({
      where: { flightNo: f.flightNo },
      update: {},
      create: {
        ...f,
        type: FlightType.PASSENGER,
        // create the schedule record in the same operation
        schedule: { create: { status: ScheduleStatus.ON_TIME } },
      },
    });
    console.log(`✓ Flight ${f.flightNo}: ${f.origin} → ${f.destination}`);
  }

  console.log('\nDatabase seeded successfully!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
