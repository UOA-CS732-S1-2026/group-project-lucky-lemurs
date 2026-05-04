import { IsString } from 'class-validator';

export class StartBuildingQuizDto {
  @IsString()
  buildingId: string;
}
