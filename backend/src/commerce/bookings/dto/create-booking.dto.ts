import { IsInt, IsArray, ValidateNested, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TicketDto {
  @IsString()
  seatNumber: string;
}

export class CreateBookingDto {
  @IsInt()
  flightId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];

  @IsNumber()
  totalPrice: number;
}

export class ModifyBookingDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets?: TicketDto[];
}
