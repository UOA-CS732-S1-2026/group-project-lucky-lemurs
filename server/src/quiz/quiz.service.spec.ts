import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QuizMode, SessionStatus } from '../common/enums';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;
  let questionsService: any;
  let buildingsService: any;
  let quizSessionModel: any;
  let userModel: any;
  let progressModel: any;

  const question = {
    id: 'q_1',
    buildingId: 'clocktower',
    questionText: 'Where is the ClockTower?',
    options: [
      { id: 'a', text: 'City Campus' },
      { id: 'b', text: 'Newmarket' },
      { id: 'c', text: 'Grafton' },
    ],
    correctOptionId: 'a',
    explanation: 'It is on City Campus.',
  };

  const building = {
    id: 'clocktower',
    name: 'ClockTower',
    shortName: 'ClockTower',
    imageUrl: '/images/buildings/clocktower.jpg',
    unlockOrder: 1,
    completionCoinReward: 5,
  };

  const query = (value: unknown) => ({
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  const makeSession = (overrides: Record<string, unknown> = {}) => ({
    id: 'session_1',
    userId: 'user_1',
    mode: QuizMode.Ranked,
    buildingId: null,
    status: SessionStatus.Active,
    questionIds: ['q_1'],
    answers: [],
    eliminatedOptions: [],
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    totalQuestions: 1,
    attemptedCount: 0,
    hintUsedCount: 0,
    hintLimit: 3,
    coinsSpent: 0,
    currentStreak: 0,
    bestStreak: 0,
    timeLimitSeconds: 60,
    startedAt: new Date('2026-01-01T00:00:00Z'),
    expiresAt: new Date('2099-01-01T00:00:00Z'),
    finishedAt: null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(() => {
    questionsService = {
      findRandomActive: jest.fn().mockResolvedValue([question]),
      findByBuildingId: jest.fn().mockResolvedValue([question]),
      findById: jest.fn().mockResolvedValue(question),
      toSafeQuestion: jest.fn((item) => ({
        id: item.id,
        questionText: item.questionText,
        options: item.options,
      })),
    };
    buildingsService = {
      findActiveById: jest.fn().mockResolvedValue(building),
      findNextActiveByUnlockOrder: jest.fn().mockResolvedValue(null),
    };
    quizSessionModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    userModel = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    progressModel = {
      findOne: jest.fn().mockReturnValue(query(null)),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    service = new QuizService(
      questionsService,
      buildingsService,
      quizSessionModel,
      {} as any,
      userModel,
      progressModel,
    );
  });

  it('returns supported quiz modes', () => {
    expect(service.getModes().modes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: QuizMode.Building,
          requiresBuilding: true,
        }),
        expect.objectContaining({
          id: QuizMode.Ranked,
          questionLimit: 20,
          timeLimitSeconds: 60,
        }),
      ]),
    );
  });

  it('starts a ranked session with safe questions only', async () => {
    const session = makeSession({
      id: 'session_ranked',
      questionIds: ['q_1'],
      totalQuestions: 20,
    });
    quizSessionModel.create.mockResolvedValue(session);

    const result = await service.startRanked('user_1');

    expect(questionsService.findRandomActive).toHaveBeenCalledWith(20);
    expect(quizSessionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        mode: QuizMode.Ranked,
        questionIds: ['q_1'],
        totalQuestions: 20,
        timeLimitSeconds: 60,
        hintLimit: 3,
      }),
    );
    expect(result).toMatchObject({
      sessionId: 'session_ranked',
      mode: QuizMode.Ranked,
      questionLimit: 20,
      timeLimitSeconds: 60,
      questions: [{ id: 'q_1', questionText: question.questionText }],
    });
  });

  it('blocks starting a locked building quiz', async () => {
    buildingsService.findActiveById.mockResolvedValue({
      ...building,
      id: 'engineering',
      unlockOrder: 2,
    });
    progressModel.findOne.mockReturnValue(query(null));

    await expect(
      service.startBuilding('user_1', { buildingId: 'engineering' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(quizSessionModel.create).not.toHaveBeenCalled();
  });

  it('starts an unlocked building quiz', async () => {
    const session = makeSession({
      id: 'building_session',
      mode: QuizMode.Building,
      buildingId: 'clocktower',
      hintLimit: 0,
      timeLimitSeconds: null,
      expiresAt: null,
    });
    quizSessionModel.create.mockResolvedValue(session);
    progressModel.findOne.mockReturnValue(query({ isUnlocked: true }));

    const result = await service.startBuilding('user_1', {
      buildingId: 'clocktower',
    });

    expect(result).toMatchObject({
      sessionId: 'building_session',
      mode: QuizMode.Building,
      building: { id: 'clocktower', name: 'ClockTower' },
      questions: [{ id: 'q_1', questionText: question.questionText }],
    });
  });

  it('submits a correct answer, updates score and awards coins', async () => {
    const session = makeSession();
    quizSessionModel.findOne.mockReturnValue(query(session));

    const result = await service.submitAnswer('user_1', 'session_1', {
      questionId: 'q_1',
      selectedOptionId: 'a',
      timeSpentSeconds: 8,
    });

    expect(result).toMatchObject({
      correct: true,
      scoreDelta: 10,
      currentScore: 10,
      correctCount: 1,
      coinReward: 1,
    });
    expect(session.save).toHaveBeenCalled();
    expect(userModel.updateOne).toHaveBeenCalledWith(
      { id: 'user_1' },
      { $inc: { coins: 1 } },
    );
  });

  it('marks incorrect building answers as retry-later', async () => {
    const session = makeSession({
      mode: QuizMode.Building,
      buildingId: 'clocktower',
      hintLimit: 0,
      timeLimitSeconds: null,
      expiresAt: null,
    });
    quizSessionModel.findOne.mockReturnValue(query(session));

    const result = await service.submitAnswer('user_1', 'session_1', {
      questionId: 'q_1',
      selectedOptionId: 'b',
      timeSpentSeconds: 4,
    });

    expect(result).toMatchObject({
      correct: false,
      scoreDelta: 0,
      retryLater: true,
    });
    expect(userModel.updateOne).not.toHaveBeenCalled();
  });

  it('rejects answers for inactive sessions', async () => {
    quizSessionModel.findOne.mockReturnValue(
      query(makeSession({ status: SessionStatus.Finished })),
    );

    await expect(
      service.submitAnswer('user_1', 'session_1', {
        questionId: 'q_1',
        selectedOptionId: 'a',
        timeSpentSeconds: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects answers for questions outside the session', async () => {
    quizSessionModel.findOne.mockReturnValue(query(makeSession()));

    await expect(
      service.submitAnswer('user_1', 'session_1', {
        questionId: 'q_other',
        selectedOptionId: 'a',
        timeSpentSeconds: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects eliminated answer options', async () => {
    quizSessionModel.findOne.mockReturnValue(
      query(
        makeSession({
          eliminatedOptions: [{ questionId: 'q_1', removedOptionIds: ['b'] }],
        }),
      ),
    );

    await expect(
      service.submitAnswer('user_1', 'session_1', {
        questionId: 'q_1',
        selectedOptionId: 'b',
        timeSpentSeconds: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('eliminates ranked options and charges coins', async () => {
    const session = makeSession();
    quizSessionModel.findOne.mockReturnValue(query(session));
    userModel.findOneAndUpdate.mockReturnValue(
      query({ id: 'user_1', coins: 6 }),
    );

    const result = await service.eliminateOptions('user_1', 'session_1', {
      questionId: 'q_1',
      count: 2,
    });

    expect(result).toMatchObject({
      questionId: 'q_1',
      newlyRemovedOptionIds: ['b', 'c'],
      coinsSpent: 4,
      totalCoinsSpent: 4,
      remainingCoins: 6,
    });
    expect(session.hintUsedCount).toBe(2);
    expect(session.save).toHaveBeenCalled();
  });

  it('rejects option elimination when the user does not have enough coins', async () => {
    quizSessionModel.findOne.mockReturnValue(query(makeSession()));
    userModel.findOneAndUpdate.mockReturnValue(query(null));
    userModel.findOne.mockReturnValue(query({ id: 'user_1', coins: 1 }));

    await expect(
      service.eliminateOptions('user_1', 'session_1', {
        questionId: 'q_1',
        count: 2,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns not found when a session does not belong to the user', async () => {
    quizSessionModel.findOne.mockReturnValue(query(null));

    await expect(
      service.finishSession('user_1', 'missing_session'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('finishes a ranked session and increments the user total score', async () => {
    const session = makeSession({
      score: 20,
      correctCount: 2,
      incorrectCount: 1,
    });
    quizSessionModel.findOne.mockReturnValue(query(session));
    quizSessionModel.find.mockReturnValue(query([{ ...session }]));

    const result = await service.finishSession('user_1', 'session_1');

    expect(session.status).toBe(SessionStatus.Finished);
    expect(userModel.updateOne).toHaveBeenCalledWith(
      { id: 'user_1' },
      { $inc: { totalScore: 20 } },
    );
    expect(result).toMatchObject({
      sessionId: 'session_1',
      status: SessionStatus.Finished,
      score: 20,
      accuracy: 2 / 3,
      rank: 1,
    });
  });

  it('ranks finished sessions using score, time, accuracy, then date', async () => {
    const base = {
      mode: QuizMode.Ranked,
      status: SessionStatus.Finished,
      startedAt: new Date('2026-01-01T00:00:00Z'),
    };
    quizSessionModel.find.mockReturnValue(
      query([
        {
          ...base,
          id: 'target',
          score: 50,
          correctCount: 5,
          incorrectCount: 0,
          finishedAt: new Date('2026-01-01T00:00:20Z'),
        },
        {
          ...base,
          id: 'higher',
          score: 60,
          correctCount: 6,
          incorrectCount: 0,
          finishedAt: new Date('2026-01-01T00:00:40Z'),
        },
        {
          ...base,
          id: 'faster',
          score: 50,
          correctCount: 4,
          incorrectCount: 1,
          finishedAt: new Date('2026-01-01T00:00:10Z'),
        },
      ]),
    );

    await expect(
      service.getRank({
        ...base,
        id: 'target',
        score: 50,
        correctCount: 5,
        incorrectCount: 0,
        finishedAt: new Date('2026-01-01T00:00:20Z'),
      } as any),
    ).resolves.toBe(3);
  });
});
