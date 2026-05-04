import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuildingsModule } from '../buildings/buildings.module';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { QuestionsModule } from '../questions/questions.module';
import {
  UserBuildingProgress,
  UserBuildingProgressSchema,
} from '../users/schemas/user-building-progress.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { QuizSession, QuizSessionSchema } from './schemas/quiz-session.schema';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    QuestionsModule,
    BuildingsModule,
    MongooseModule.forFeature([
      { name: QuizSession.name, schema: QuizSessionSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
      {
        name: UserBuildingProgress.name,
        schema: UserBuildingProgressSchema,
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
