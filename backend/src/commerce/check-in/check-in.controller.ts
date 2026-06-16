import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  /** UC09 — Check in for a specific ticket */
  @Post(':ticketId')
  checkIn(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.checkInService.checkIn(ticketId, user.id);
  }
}
