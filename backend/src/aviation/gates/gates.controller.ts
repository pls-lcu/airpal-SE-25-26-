import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GatesService } from './gates.service';
import { AssignGateDto } from './dto/assign-gate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('gates')
export class GatesController {
  constructor(private readonly gatesService: GatesService) {}

  @Get()
  findAll() {
    return this.gatesService.findAll();
  }

  /** UC22 — GroundManager assigns a gate */
  @UseGuards(JwtAuthGuard)
  @Post('assign')
  assign(@Body() dto: AssignGateDto, @CurrentUser() user: { id: number }) {
    return this.gatesService.assign(dto, user.id);
  }
}
