import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, ModifyBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** UC07 — Book a flight */
  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: { id: number }) {
    return this.bookingsService.create(dto, user.id);
  }

  /** UC08 — List active bookings */
  @Get()
  findMine(@CurrentUser() user: { id: number }) {
    return this.bookingsService.findByPassenger(user.id);
  }

  /** UC08 — Modify a booking */
  @Patch(':id')
  modify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModifyBookingDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.bookingsService.modify(id, dto, user.id);
  }

  /** UC08 — Cancel a booking */
  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.bookingsService.cancel(id, user.id);
  }
}
