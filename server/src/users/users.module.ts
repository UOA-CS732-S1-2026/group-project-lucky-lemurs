import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  QuizSession,
  QuizSessionSchema,
} from '../quiz/schemas/quiz-session.schema';
import {
  UserBuildingProgress,
  UserBuildingProgressSchema,
} from './schemas/user-building-progress.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: QuizSession.name, schema: QuizSessionSchema },
      {
        name: UserBuildingProgress.name,
        schema: UserBuildingProgressSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
