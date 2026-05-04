import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  QuizSession,
  QuizSessionSchema,
} from '../quiz/schemas/quiz-session.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizSession.name, schema: QuizSessionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
