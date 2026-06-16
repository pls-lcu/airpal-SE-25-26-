import { Module } from '@nestjs/common';
import { FlightsController } from './flights/flights.controller';
import { FlightsService } from './flights/flights.service';
import { GatesController } from './gates/gates.controller';
import { GatesService } from './gates/gates.service';
import { SchedulingEngineStub } from '../common/stubs/scheduling-engine.stub';

@Module({
  controllers: [FlightsController, GatesController],
  providers: [FlightsService, GatesService, SchedulingEngineStub],
})
export class AviationModule {}
