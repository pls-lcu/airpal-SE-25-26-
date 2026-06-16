import { IsString } from 'class-validator';

export class CreateBugReportDto {
  @IsString()
  description: string;
}

export class CreateSupportTicketDto {
  @IsString()
  description: string;
}

export class CreateAssistanceRequestDto {
  @IsString()
  type: string;
}

export class CreateLostItemReportDto {
  @IsString()
  description: string;
}
