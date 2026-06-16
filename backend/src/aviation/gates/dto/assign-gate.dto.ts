import { IsInt, IsString } from 'class-validator';

export class AssignGateDto {
  @IsInt()
  flightId: number;

  @IsString()
  gateID: string;
}
