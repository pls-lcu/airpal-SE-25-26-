import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBugReportDto,
  CreateSupportTicketDto,
  CreateAssistanceRequestDto,
  CreateLostItemReportDto,
} from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** UC16 — Passenger submits a bug report */
  createBugReport(dto: CreateBugReportDto, reporterId: number) {
    return this.prisma.bugReport.create({ data: { description: dto.description, reporterId } });
  }

  /** UC17 — Passenger creates a customer support ticket */
  createSupportTicket(dto: CreateSupportTicketDto, passengerId: number) {
    return this.prisma.customerSupportTicket.create({
      data: { description: dto.description, passengerId },
    });
  }

  /** UC15 — Passenger requests special assistance */
  createAssistanceRequest(dto: CreateAssistanceRequestDto, passengerId: number) {
    return this.prisma.assistanceRequest.create({
      data: { type: dto.type, passengerId },
    });
  }

  /** UC14 — Passenger files a lost item report */
  createLostItemReport(dto: CreateLostItemReportDto, passengerId: number) {
    return this.prisma.lostItemReport.create({
      data: { description: dto.description, passengerId },
    });
  }
}
