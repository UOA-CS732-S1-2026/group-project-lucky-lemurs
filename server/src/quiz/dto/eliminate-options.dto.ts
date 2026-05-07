import { IsInt, IsString, Max, Min } from 'class-validator';

export class EliminateOptionsDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(2)
  count: number;
}
