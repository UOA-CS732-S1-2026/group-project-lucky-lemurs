import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizMode, SessionStatus } from '../common/enums';
import { QuizSession } from '../quiz/schemas/quiz-session.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(QuizSession.name)
    private readonly quizSessionModel: Model<QuizSession>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async getLeaderboard(userId: string, mode: string, period: string) {
    const rankedMode: string = QuizMode.Ranked;
    if (mode !== rankedMode) {
      throw new BadRequestException('Only ranked leaderboard is supported');
    }

    const sessions = await this.quizSessionModel
      .find({ mode: QuizMode.Ranked, status: SessionStatus.Finished })
      .lean()
      .exec();
    const sorted = sessions.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aTime = this.getTimeUsedSeconds(a);
      const bTime = this.getTimeUsedSeconds(b);
      if (aTime !== bTime) {
        return aTime - bTime;
      }

      const aAccuracy = this.getAccuracy(a.correctCount, a.incorrectCount);
      const bAccuracy = this.getAccuracy(b.correctCount, b.incorrectCount);
      if (aAccuracy !== bAccuracy) {
        return bAccuracy - aAccuracy;
      }

      return (
        new Date(a.finishedAt ?? a.startedAt).getTime() -
        new Date(b.finishedAt ?? b.startedAt).getTime()
      );
    });

    const userIds = [...new Set(sorted.map((session) => session.userId))];
    const users = await this.userModel
      .find({ id: { $in: userIds } })
      .lean()
      .exec();
    const usersById = new Map(users.map((user) => [user.id, user]));

    const rankedEntries = sorted.map((session, index) => {
      const user = usersById.get(session.userId);

      return {
        rank: index + 1,
        userId: session.userId,
        username: user?.username ?? 'Unknown user',
        avatarUrl: user?.avatarUrl ?? '/images/avatars/default.png',
        score: session.score,
        accuracy: this.getAccuracy(
          session.correctCount,
          session.incorrectCount,
        ),
        timeUsedSeconds: this.getTimeUsedSeconds(session),
        playedAt: session.finishedAt ?? session.startedAt,
      };
    });

    const myEntry = rankedEntries.find((entry) => entry.userId === userId);

    return {
      mode: QuizMode.Ranked,
      period,
      entries: rankedEntries.slice(0, 50),
      myRank: myEntry
        ? {
            rank: myEntry.rank,
            score: myEntry.score,
          }
        : null,
    };
  }

  private getTimeUsedSeconds(session: QuizSession): number {
    const end = session.finishedAt ?? new Date();
    return Math.max(
      0,
      Math.round(
        (new Date(end).getTime() - new Date(session.startedAt).getTime()) /
          1000,
      ),
    );
  }

  private getAccuracy(correctCount: number, incorrectCount: number): number {
    const answered = correctCount + incorrectCount;
    return answered > 0 ? correctCount / answered : 0;
  }
}
