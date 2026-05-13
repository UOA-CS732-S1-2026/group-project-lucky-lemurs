import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QuizMode, SessionStatus } from '../common/enums';
import { QuizSession } from '../quiz/schemas/quiz-session.schema';
import { UserBuildingProgress } from './schemas/user-building-progress.schema';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;
  let quizSessionModel: any;
  let progressModel: any;

  const user = {
    id: 'user_1',
    username: 'tester',
    email: 'tester@example.com',
    avatarUrl: '/images/avatars/default.png',
    totalScore: 30,
    coins: 4,
    currentStreak: 1,
    bestStreak: 3,
    strongestCategory: null,
    badges: [],
  };

  const query = (value: unknown) => ({
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  beforeEach(async () => {
    userModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    quizSessionModel = {
      find: jest.fn(),
    };
    progressModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(QuizSession.name),
          useValue: quizSessionModel,
        },
        {
          provide: getModelToken(UserBuildingProgress.name),
          useValue: progressModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user through the user model', async () => {
    userModel.create.mockResolvedValue(user);

    await expect(
      service.create({
        username: 'tester',
        email: 'tester@example.com',
        passwordHash: 'hash',
      }),
    ).resolves.toBe(user);
  });

  it('normalises email before searching by email', async () => {
    userModel.findOne.mockReturnValue(query(user));

    await expect(service.findByEmail('Tester@Example.com')).resolves.toBe(user);
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'tester@example.com',
    });
  });

  it('removes private fields when creating a public user response', () => {
    expect(
      service.toPublicUser({ ...user, passwordHash: 'secret' } as any),
    ).toEqual(user);
  });

  it('records a login timestamp for the user', async () => {
    userModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await service.recordLogin('user_1');

    expect(userModel.updateOne).toHaveBeenCalledWith(
      { id: 'user_1' },
      { lastLoginAt: expect.any(Date) },
    );
  });

  it('returns profile metrics from finished sessions and completed buildings', async () => {
    userModel.findOne.mockReturnValue(query(user));
    quizSessionModel.find
      .mockReturnValueOnce(
        query([
          { correctCount: 2, incorrectCount: 1 },
          { correctCount: 1, incorrectCount: 0 },
        ]),
      )
      .mockReturnValueOnce(
        query([
          {
            id: 'session_other',
            userId: 'other',
            mode: QuizMode.Ranked,
            status: SessionStatus.Finished,
            score: 50,
          },
          {
            id: 'session_user',
            userId: 'user_1',
            mode: QuizMode.Ranked,
            status: SessionStatus.Finished,
            score: 40,
          },
        ]),
      );
    progressModel.find.mockReturnValue(query([{ buildingId: 'clocktower' }]));

    await expect(service.getProfile('user_1')).resolves.toEqual({
      ...user,
      rank: 2,
      completedBuildingCount: 1,
      accuracy: 0.75,
    });
  });

  it('throws when the profile user cannot be found', async () => {
    userModel.findOne.mockReturnValue(query(null));

    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects profile updates that reuse another username', async () => {
    userModel.findOne.mockReturnValue(
      query({ id: 'other', username: 'taken' }),
    );

    await expect(
      service.updateProfile('user_1', { username: 'taken' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(userModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('updates the profile and returns editable public fields', async () => {
    userModel.findOne.mockReturnValue(query(null));
    userModel.findOneAndUpdate.mockReturnValue(
      query({ ...user, username: 'updated' }),
    );

    await expect(
      service.updateProfile('user_1', { username: 'updated' }),
    ).resolves.toEqual({
      id: 'user_1',
      username: 'updated',
      email: 'tester@example.com',
      avatarUrl: '/images/avatars/default.png',
    });
  });

  it('returns sorted building progress for a user', async () => {
    const progress = [
      {
        buildingId: 'clocktower',
        isUnlocked: true,
        isCompleted: true,
        bestScore: 30,
        correctCount: 3,
        totalQuestions: 3,
        coinsAwarded: 5,
        unlockedAt: new Date('2026-01-01T00:00:00Z'),
        completedAt: new Date('2026-01-02T00:00:00Z'),
        lastPlayedAt: new Date('2026-01-02T00:00:00Z'),
      },
    ];
    progressModel.find.mockReturnValue(query(progress));

    await expect(service.getProgress('user_1')).resolves.toEqual({
      userId: 'user_1',
      buildingProgress: progress,
    });
  });
});
