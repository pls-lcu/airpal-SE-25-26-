import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SchedulingEngineStub } from '../../common/stubs/scheduling-engine.stub';
import { AssignGateDto } from './dto/assign-gate.dto';

@Injectable()
export class GatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulingEngine: SchedulingEngineStub,
  ) {}

  findAll() {
    return this.prisma.gate.findMany();
  }

  /** UC22 — GroundManager assigns a gate to a flight */
  async assign(_dto: AssignGateDto, _groundManagerId: number) {
    // Implemented in step 3
    throw new Error('Not implemented');
  }
}
