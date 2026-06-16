import { Module } from '@nestjs/common';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';
import { CheckInController } from './check-in/check-in.controller';
import { CheckInService } from './check-in/check-in.service';
import { PaymentStub } from '../common/stubs/payment.stub';
import { EmailStub } from '../common/stubs/email.stub';

@Module({
  controllers: [BookingsController, CheckInController],
  providers: [BookingsService, CheckInService, PaymentStub, EmailStub],
})
export class CommerceModule {}
