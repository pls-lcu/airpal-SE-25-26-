import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PricingEngineStub {
  private readonly logger = new Logger(PricingEngineStub.name);

  async getTicketPrice(flightNo: string, seatClass: string): Promise<number> {
    this.logger.log(`[STUB] PricingEngine: price request for ${flightNo} class ${seatClass}`);
    return 199.99;
  }
}
