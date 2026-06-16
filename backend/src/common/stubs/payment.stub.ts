import { Injectable, Logger } from '@nestjs/common';

export interface PaymentResult {
  approved: boolean;
  transactionId: string;
}

@Injectable()
export class PaymentStub {
  private readonly logger = new Logger(PaymentStub.name);

  async processPayment(amount: number, _paymentInfo: unknown): Promise<PaymentResult> {
    this.logger.log(`[STUB] Processing payment of €${amount}`);
    return { approved: true, transactionId: `TXN-${Date.now()}` };
  }
}
