import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailStub } from '../../common/stubs/email.stub';
import { BookingStatus } from '../../generated/prisma/enums';

@Injectable()
export class CheckInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailStub,
  ) {}

  // ─────────────────────────────────────────
  // UC09 — Online check-in
  //
  // The passenger checks in for a specific ticket.
  // We validate the request, mark the ticket as checked in,
  // and send a boarding pass to their email (stubbed).
  // ─────────────────────────────────────────

  async checkIn(ticketId: number, passengerId: number) {
    // Step 1: Find the ticket and load its booking (which has the flight and passenger)
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          include: {
            flight: true,
            passenger: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Step 2: Make sure this ticket belongs to the passenger making the request
    if (ticket.booking.passengerId !== passengerId) {
      throw new ForbiddenException('You can only check in for your own tickets');
    }

    // Step 3: Various validation checks

    if (ticket.booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot check in for a cancelled booking');
    }

    if (ticket.checkedIn) {
      // Prevent checking in twice for the same ticket
      throw new BadRequestException('You have already checked in for this ticket');
    }

    if (new Date() > ticket.booking.flight.departureTime) {
      // The flight has already left — too late to check in
      throw new BadRequestException('Check-in window has closed — this flight has already departed');
    }

    // Step 4: Mark the ticket as checked in
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { checkedIn: true },
    });

    // Step 5: Build a simple boarding pass and send it via email (stubbed — logs to console)
    const { flight, passenger } = ticket.booking;

    const boardingPassText = [
      '============================',
      '        BOARDING PASS',
      '============================',
      `Passenger : ${passenger.name} ${passenger.surname}`,
      `Flight    : ${flight.flightNo}`,
      `Route     : ${flight.origin} → ${flight.destination}`,
      `Seat      : ${ticket.seatNumber}`,
      `Departure : ${flight.departureTime.toUTCString()}`,
      '============================',
    ].join('\n');

    await this.email.sendBoardingPass(passenger.email, boardingPassText);

    return {
      message: 'Check-in successful! Your boarding pass has been sent to your email (check the console).',
      boardingPass: {
        flightNo: flight.flightNo,
        route: `${flight.origin} → ${flight.destination}`,
        seat: ticket.seatNumber,
        departure: flight.departureTime,
      },
    };
  }
}
