import { BadRequestException } from '@nestjs/common';
import { QuizMode, SessionStatus } from '../common/enums';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let quizSessionModel: any;
  let userModel: any;

  const query = (value: unknown) => ({
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  beforeEach(() => {
    quizSessionModel = {
      find: jest.fn(),
    };
    userModel = {
      find: jest.fn(),
    };
    service = new LeaderboardService(quizSessionModel, userModel);
  });

  it('rejects unsupported leaderboard modes', async () => {
    await expect(
      service.getLeaderboard('user_1', 'building', 'all'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sorts ranked entries by score, time, accuracy, and played date', async () => {
    const sessions = [
      {
        id: 'slower',
        userId: 'user_2',
        mode: QuizMode.Ranked,
        status: SessionStatus.Finished,
        score: 80,
        correctCount: 8,
        incorrectCount: 2,
        startedAt: new Date('2026-01-01T00:00:00Z'),
        finishedAt: new Date('2026-01-01T00:00:50Z'),
      },
      {
        id: 'higher-score',
        userId: 'user_3',
        mode: QuizMode.Ranked,
        status: SessionStatus.Finished,
        score: 90,
        correctCount: 9,
        incorrectCount: 1,
        startedAt: new Date('2026-01-01T00:00:00Z'),
        finishedAt: new Date('2026-01-01T00:00:55Z'),
      },
      {
        id: 'faster',
        userId: 'user_1',
        mode: QuizMode.Ranked,
        status: SessionStatus.Finished,
        score: 80,
        correctCount: 7,
        incorrectCount: 3,
        startedAt: new Date('2026-01-01T00:00:00Z'),
        finishedAt: new Date('2026-01-01T00:00:30Z'),
      },
    ];
    quizSessionModel.find.mockReturnValue(query(sessions));
    userModel.find.mockReturnValue(
      query([
        {
          id: 'user_1',
          username: 'Ada',
          avatarUrl: '/ada.png',
        },
        {
          id: 'user_2',
          username: 'Grace',
          avatarUrl: '/grace.png',
        },
        {
          id: 'user_3',
          username: 'Linus',
          avatarUrl: '/linus.png',
        },
      ]),
    );

    const result = await service.getLeaderboard('user_1', 'ranked', 'all');

    expect(result.entries.map((entry) => entry.userId)).toEqual([
      'user_3',
      'user_1',
      'user_2',
    ]);
    expect(result.entries[1]).toMatchObject({
      rank: 2,
      username: 'Ada',
      score: 80,
      accuracy: 0.7,
      timeUsedSeconds: 30,
    });
    expect(result.myRank).toEqual({ rank: 2, score: 80 });
  });

  it('uses fallback user display data when a user record is missing', async () => {
    quizSessionModel.find.mockReturnValue(
      query([
        {
          id: 'session_1',
          userId: 'missing_user',
          mode: QuizMode.Ranked,
          status: SessionStatus.Finished,
          score: 10,
          correctCount: 1,
          incorrectCount: 0,
          startedAt: new Date('2026-01-01T00:00:00Z'),
          finishedAt: new Date('2026-01-01T00:00:05Z'),
        },
      ]),
    );
    userModel.find.mockReturnValue(query([]));

    const result = await service.getLeaderboard('viewer', 'ranked', 'all');

    expect(result.entries[0]).toMatchObject({
      username: 'Unknown user',
      avatarUrl: '/images/avatars/default.png',
    });
    expect(result.myRank).toBeNull();
  });
});
