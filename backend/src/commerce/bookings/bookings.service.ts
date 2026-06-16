import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStub } from '../../common/stubs/payment.stub';
import { EmailStub } from '../../common/stubs/email.stub';
import { CreateBookingDto, ModifyBookingDto } from './dto/create-booking.dto';
import { BookingStatus, ScheduleStatus } from '../../generated/prisma/enums';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payment: PaymentStub,
    private readonly email: EmailStub,
  ) {}

  // ─────────────────────────────────────────
  // UC07 — Passenger books a flight
  // ─────────────────────────────────────────

  async create(dto: CreateBookingDto, passengerId: number) {
    // Step 1: Make sure the flight exists and isn't cancelled
    const flight = await this.prisma.flight.findUnique({
      where: { id: dto.flightId },
      include: { schedule: true },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with id ${dto.flightId} not found`);
    }

    if (flight.schedule?.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Cannot book a cancelled flight');
    }

    // Step 2: Make sure no one else already has the requested seats on this flight.
    // We query all tickets matching the requested seat numbers for active bookings
    // on the same flight (status != CANCELLED).
    const requestedSeats = dto.tickets.map((t) => t.seatNumber);

    const takenSeats = await this.prisma.ticket.findMany({
      where: {
        seatNumber: { in: requestedSeats },
        booking: {
          flightId: dto.flightId,
          status: { not: BookingStatus.CANCELLED },
        },
      },
    });

    if (takenSeats.length > 0) {
      const takenList = takenSeats.map((t) => t.seatNumber).join(', ');
      throw new ConflictException(`Seat(s) already taken: ${takenList}`);
    }

    // Step 3: Process payment through the payment stub.
    // In a real app this is where you'd call Stripe, PayPal, etc.
    const paymentResult = await this.payment.processPayment(dto.totalPrice, {});

    if (!paymentResult.approved) {
      // This never happens with our stub, but a real payment gateway can decline
      throw new BadRequestException('Payment was declined. Please try a different payment method.');
    }

    // Step 4: Create the booking and all its tickets in a single database transaction.
    // $transaction ensures that if anything fails, nothing is saved — all or nothing.
    const booking = await this.prisma.$transaction(async (tx) => {
      return tx.booking.create({
        data: {
          passengerId,
          flightId: dto.flightId,
          totalPrice: dto.totalPrice,
          status: BookingStatus.CONFIRMED,
          // Create all the ticket rows at the same time
          tickets: {
            create: dto.tickets.map((t) => ({ seatNumber: t.seatNumber })),
          },
        },
        include: { tickets: true, flight: true },
      });
    });

    // Step 5: Send booking confirmation email (stubbed — logs to console)
    const passenger = await this.prisma.user.findUnique({ where: { id: passengerId } });
    await this.email.sendBookingConfirmation(passenger!.email, booking.bookingRef);

    return {
      message: 'Booking confirmed!',
      bookingRef: booking.bookingRef,
      transactionId: paymentResult.transactionId,
      booking,
    };
  }

  // ─────────────────────────────────────────
  // UC08 — Passenger modifies an existing booking (seat change)
  // ─────────────────────────────────────────

  async modify(bookingId: number, dto: ModifyBookingDto, passengerId: number) {
    // Step 1: Find the booking and make sure it belongs to this passenger
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tickets: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.passengerId !== passengerId) {
      // A passenger can only modify their own bookings
      throw new ForbiddenException('You can only modify your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot modify a cancelled booking');
    }

    if (!dto.tickets || dto.tickets.length === 0) {
      throw new BadRequestException('Please provide the new seat selections');
    }

    // Step 2: Check the new seats aren't taken by someone else
    // We exclude the current booking from the conflict check (it's fine to keep the same seats)
    const newSeatNumbers = dto.tickets.map((t) => t.seatNumber);

    const takenSeats = await this.prisma.ticket.findMany({
      where: {
        seatNumber: { in: newSeatNumbers },
        booking: {
          flightId: booking.flightId,
          status: { not: BookingStatus.CANCELLED },
          id: { not: bookingId }, // exclude current booking's own tickets
        },
      },
    });

    if (takenSeats.length > 0) {
      const takenList = takenSeats.map((t) => t.seatNumber).join(', ');
      throw new ConflictException(`Seat(s) already taken: ${takenList}`);
    }

    // Step 3: Replace the old tickets with new ones inside a transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      // Delete all existing tickets for this booking first
      await tx.ticket.deleteMany({ where: { bookingId } });

      // Then create the new ones and mark the booking as MODIFIED
      return tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.MODIFIED,
          tickets: {
            create: dto.tickets!.map((t) => ({ seatNumber: t.seatNumber })),
          },
        },
        include: { tickets: true, flight: true },
      });
    });

    return { message: 'Booking updated successfully', booking: updated };
  }

  // ─────────────────────────────────────────
  // UC08 — Passenger cancels a booking
  // ─────────────────────────────────────────

  async cancel(bookingId: number, passengerId: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.passengerId !== passengerId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('This booking is already cancelled');
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    return { message: 'Booking cancelled successfully' };
  }

  // ─────────────────────────────────────────
  // UC08 — List all bookings for the logged-in passenger
  // ─────────────────────────────────────────

  findByPassenger(passengerId: number) {
    return this.prisma.booking.findMany({
      where: { passengerId },
      include: { tickets: true, flight: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────
  // UC12 — Access passenger dashboard
  //
  // Returns all bookings for the logged-in passenger with full flight details:
  // gate, carousel, schedule status, and per-ticket check-in state.
  //   GET /api/bookings/dashboard
  // ─────────────────────────────────────────

  async dashboard(passengerId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { passengerId },
      include: {
        tickets: true,
        flight: {
          include: {
            schedule: true,
            gate: true,
            aircraft: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Split into upcoming and past based on departure time
    const now = new Date();
    const upcoming = bookings.filter(
      (b) => b.flight.departureTime > now && b.status !== 'CANCELLED',
    );
    const past = bookings.filter(
      (b) => b.flight.departureTime <= now || b.status === 'CANCELLED',
    );

    return { upcoming, past };
  }
}
