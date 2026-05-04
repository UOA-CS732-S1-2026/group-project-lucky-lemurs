import { IsInt, IsString, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  selectedOptionId: string;

  @IsInt()
  @Min(0)
  timeSpentSeconds: number;
}
