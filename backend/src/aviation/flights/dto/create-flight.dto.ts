import { IsDateString, IsEnum, IsString } from 'class-validator';
import { FlightType } from '../../../generated/prisma/enums';

export class CreateFlightDto {
  @IsString()
  flightNo: string;

  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsDateString()
  departureTime: string;

  @IsDateString()
  arrivalTime: string;

  @IsEnum(FlightType)
  type: FlightType;
}
