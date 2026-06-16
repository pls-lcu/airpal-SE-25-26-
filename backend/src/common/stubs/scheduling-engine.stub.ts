import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SchedulingEngineStub {
  private readonly logger = new Logger(SchedulingEngineStub.name);

  async notifyGateAssignment(flightNo: string, gateID: string): Promise<void> {
    this.logger.log(`[STUB] SchedulingEngine notified: flight ${flightNo} → gate ${gateID}`);
  }
}
