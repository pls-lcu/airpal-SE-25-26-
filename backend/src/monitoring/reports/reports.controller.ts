import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  CreateBugReportDto,
  CreateSupportTicketDto,
  CreateAssistanceRequestDto,
  CreateLostItemReportDto,
} from './dto/create-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** UC16 */
  @Post('bugs')
  createBugReport(@Body() dto: CreateBugReportDto, @CurrentUser() user: { id: number }) {
    return this.reportsService.createBugReport(dto, user.id);
  }

  /** UC17 */
  @Post('support')
  createSupportTicket(@Body() dto: CreateSupportTicketDto, @CurrentUser() user: { id: number }) {
    return this.reportsService.createSupportTicket(dto, user.id);
  }

  /** UC15 */
  @Post('assistance')
  createAssistanceRequest(
    @Body() dto: CreateAssistanceRequestDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.reportsService.createAssistanceRequest(dto, user.id);
  }

  /** UC14 */
  @Post('lost-items')
  createLostItemReport(
    @Body() dto: CreateLostItemReportDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.reportsService.createLostItemReport(dto, user.id);
  }
}
