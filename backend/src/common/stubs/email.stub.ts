import { Injectable, Logger } from '@nestjs/common';

// This is a STUB — it simulates an email provider without actually sending any emails.
// In a real application you would replace this with something like Nodemailer or SendGrid.
// For this university project, every "email" is just printed to the server console.
@Injectable()
export class EmailStub {
  // NestJS Logger prints messages to the console with a label so we can identify them
  private readonly logger = new Logger('EmailProvider');

  // Called after registration — sends the link the user clicks to activate their account
  async sendVerificationLink(to: string, link: string): Promise<void> {
    this.logger.log(`[STUB] Sending verification email to: ${to}`);
    this.logger.log(`[STUB] Verification link: ${link}`);
  }

  // Called during password reset — sends the link the user clicks to set a new password
  async sendPasswordResetLink(to: string, link: string): Promise<void> {
    this.logger.log(`[STUB] Sending password reset email to: ${to}`);
    this.logger.log(`[STUB] Reset link: ${link}`);
  }

  // Called after a booking is confirmed — sends a summary to the passenger
  async sendBookingConfirmation(to: string, bookingRef: string): Promise<void> {
    this.logger.log(`[STUB] Sending booking confirmation to: ${to} | Booking ref: ${bookingRef}`);
  }

  // Called after online check-in — sends the boarding pass to the passenger
  async sendBoardingPass(to: string, boardingPassData: string): Promise<void> {
    this.logger.log(`[STUB] Sending boarding pass to: ${to}`);
    this.logger.log(`[STUB] Boarding pass: ${boardingPassData}`);
  }
}
