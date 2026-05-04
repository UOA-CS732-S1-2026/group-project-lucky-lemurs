import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Building, BuildingSchema } from '../buildings/schemas/building.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuestionsService } from './questions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Building.name, schema: BuildingSchema },
    ]),
  ],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
