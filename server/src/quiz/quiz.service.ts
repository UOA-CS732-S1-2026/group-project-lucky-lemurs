import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BuildingsService } from '../buildings/buildings.service';
import { QuizMode, SessionStatus } from '../common/enums';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/schemas/question.schema';
import { UserBuildingProgress } from '../users/schemas/user-building-progress.schema';
import { User } from '../users/schemas/user.schema';
import { EliminateOptionsDto } from './dto/eliminate-options.dto';
import { StartBuildingQuizDto } from './dto/start-building-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  QuizSession,
  QuizSessionDocument,
} from './schemas/quiz-session.schema';

const RANKED_QUESTION_LIMIT = 20;
const RANKED_TIME_LIMIT_SECONDS = 60;
const RANKED_HINT_LIMIT = 3;
const CORRECT_SCORE_DELTA = 10;
const ELIMINATE_ONE_COST = 2;
const ELIMINATE_TWO_COST = 4;

@Injectable()
export class QuizService {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly buildingsService: BuildingsService,
    @InjectModel(QuizSession.name)
    private readonly quizSessionModel: Model<QuizSession>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(UserBuildingProgress.name)
    private readonly progressModel: Model<UserBuildingProgress>,
  ) {}

  getModes() {
    return {
      modes: [
        {
          id: QuizMode.Building,
          name: 'Building Challenge',
          description: 'Answer questions based on a selected UOA building.',
          requiresBuilding: true,
        },
        {
          id: QuizMode.Ranked,
          name: 'Ranked Mode',
          description:
            'Answer 20 questions within 60 seconds and compete on the leaderboard.',
          requiresBuilding: false,
          questionLimit: RANKED_QUESTION_LIMIT,
          timeLimitSeconds: RANKED_TIME_LIMIT_SECONDS,
        },
      ],
    };
  }

  async startRanked(userId: string) {
    const questions = await this.questionsService.findRandomActive(
      RANKED_QUESTION_LIMIT,
    );
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + RANKED_TIME_LIMIT_SECONDS * 1000,
    );

    const session = await this.quizSessionModel.create({
      userId,
      mode: QuizMode.Ranked,
      buildingId: null,
      questionIds: questions.map((question) => question.id),
      totalQuestions: RANKED_QUESTION_LIMIT,
      timeLimitSeconds: RANKED_TIME_LIMIT_SECONDS,
      hintLimit: RANKED_HINT_LIMIT,
      startedAt,
      expiresAt,
    });

    return {
      sessionId: session.id,
      mode: session.mode,
      questionLimit: RANKED_QUESTION_LIMIT,
      timeLimitSeconds: RANKED_TIME_LIMIT_SECONDS,
      startedAt,
      expiresAt,
      questions: questions.map((question) =>
        this.questionsService.toSafeQuestion(question),
      ),
    };
  }

  async startBuilding(userId: string, dto: StartBuildingQuizDto) {
    const [building, questions] = await Promise.all([
      this.buildingsService.findActiveById(dto.buildingId),
      this.questionsService.findByBuildingId(dto.buildingId),
    ]);
    const progress = await this.progressModel
      .findOne({ userId, buildingId: building.id })
      .lean()
      .exec();
    const isUnlocked = progress?.isUnlocked ?? building.unlockOrder === 1;

    if (!isUnlocked) {
      throw new ForbiddenException('Building is locked');
    }

    const session = await this.quizSessionModel.create({
      userId,
      mode: QuizMode.Building,
      buildingId: building.id,
      questionIds: questions.map((question) => question.id),
      totalQuestions: questions.length,
      hintLimit: 0,
      timeLimitSeconds: null,
      expiresAt: null,
    });

    return {
      sessionId: session.id,
      mode: session.mode,
      building: {
        id: building.id,
        name: building.name,
        shortName: building.shortName,
        imageUrl: building.imageUrl,
      },
      questions: questions.map((question) =>
        this.questionsService.toSafeQuestion(question),
      ),
    };
  }

  async submitAnswer(userId: string, sessionId: string, dto: SubmitAnswerDto) {
    const session = await this.findUserSession(userId, sessionId);
    if (session.status !== SessionStatus.Active) {
      throw new ConflictException('Quiz session is not active');
    }

    if (
      session.mode === QuizMode.Ranked &&
      session.expiresAt &&
      new Date() > session.expiresAt
    ) {
      session.status = SessionStatus.Expired;
      await session.save();
      throw new ForbiddenException('Ranked session has expired');
    }

    if (!session.questionIds.includes(dto.questionId)) {
      throw new BadRequestException('Question does not belong to this session');
    }

    const question = await this.questionsService.findById(dto.questionId);
    if (
      !question.options.some((option) => option.id === dto.selectedOptionId)
    ) {
      throw new BadRequestException('selectedOptionId is invalid');
    }

    const removedOptionIds = this.getRemovedOptionIds(session, dto.questionId);
    if (removedOptionIds.includes(dto.selectedOptionId)) {
      throw new BadRequestException('selectedOptionId has been eliminated');
    }

    const alreadyCorrect = session.answers.some(
      (answer) => answer.questionId === dto.questionId && answer.isCorrect,
    );
    if (alreadyCorrect) {
      throw new ConflictException(
        'Question has already been answered correctly',
      );
    }

    if (
      session.mode === QuizMode.Ranked &&
      session.answers.some((answer) => answer.questionId === dto.questionId)
    ) {
      throw new ConflictException('Question has already been answered');
    }

    const correct = question.correctOptionId === dto.selectedOptionId;
    const scoreDelta = correct ? CORRECT_SCORE_DELTA : 0;

    // 积分地板除10的金币奖励
    const coinReward = Math.floor(scoreDelta / 10);

    session.attemptedCount += 1;
    if (correct) {
      session.currentStreak += 1;
      session.bestStreak = Math.max(session.bestStreak, session.currentStreak);
    } else {
      session.currentStreak = 0;
    }
    session.answers.push({
      questionId: question.id,
      selectedOptionId: dto.selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect: correct,
      scoreDelta,
      timeSpentSeconds: dto.timeSpentSeconds,
      usedHint: false,
      removedOptionIds,
      answeredAt: new Date(),
    });
    session.score += scoreDelta;
    if (correct) {
      session.correctCount += 1;
    } else {
      session.incorrectCount += 1;
    }

    // 发放金币奖励
    if (coinReward > 0) {
      await this.userModel.updateOne(
        { id: session.userId },
        { $inc: { coins: coinReward } },
      );
    }

    await session.save();

    return {
      sessionId: session.id,
      questionId: question.id,
      correct,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
      scoreDelta,
      currentScore: session.score,
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      currentStreak: session.currentStreak,
      bestStreak: session.bestStreak,
      coinReward, // 新增金币奖励信息
      ...(session.mode === QuizMode.Building && !correct
        ? { retryLater: true }
        : {}),
    };
  }

  async eliminateOptions(
    userId: string,
    sessionId: string,
    dto: EliminateOptionsDto,
  ) {
    const session = await this.findUserSession(userId, sessionId);
    if (session.status !== SessionStatus.Active) {
      throw new ConflictException('Quiz session is not active');
    }

    if (session.mode !== QuizMode.Ranked) {
      throw new BadRequestException(
        'Option elimination is only available in test mode',
      );
    }

    if (session.expiresAt && new Date() > session.expiresAt) {
      session.status = SessionStatus.Expired;
      await session.save();
      throw new ForbiddenException('Test mode session has expired');
    }

    if (!session.questionIds.includes(dto.questionId)) {
      throw new BadRequestException('Question does not belong to this session');
    }

    if (
      session.answers.some((answer) => answer.questionId === dto.questionId)
    ) {
      throw new ConflictException('Question has already been answered');
    }

    const question = await this.questionsService.findById(dto.questionId);
    const existingRemovedOptionIds = this.getRemovedOptionIds(
      session,
      dto.questionId,
    );
    const removableOptionIds = question.options
      .map((option) => option.id)
      .filter(
        (optionId) =>
          optionId !== question.correctOptionId &&
          !existingRemovedOptionIds.includes(optionId),
      );

    if (removableOptionIds.length < dto.count) {
      throw new BadRequestException('Not enough options left to eliminate');
    }

    const cost = dto.count === 2 ? ELIMINATE_TWO_COST : ELIMINATE_ONE_COST;
    const userUpdate = await this.userModel
      .findOneAndUpdate(
        { id: userId, coins: { $gte: cost } },
        { $inc: { coins: -cost } },
        { new: true },
      )
      .lean()
      .exec();

    if (!userUpdate) {
      const user = await this.userModel.findOne({ id: userId }).lean().exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      throw new ForbiddenException('Not enough coins');
    }

    const newlyRemovedOptionIds = removableOptionIds.slice(0, dto.count);
    const updatedRemovedOptionIds = [
      ...existingRemovedOptionIds,
      ...newlyRemovedOptionIds,
    ];
    session.eliminatedOptions ??= [];
    const helpIndex = session.eliminatedOptions.findIndex(
      (item) => item.questionId === dto.questionId,
    );

    if (helpIndex >= 0) {
      session.eliminatedOptions[helpIndex].removedOptionIds =
        updatedRemovedOptionIds;
    } else {
      session.eliminatedOptions.push({
        questionId: dto.questionId,
        removedOptionIds: updatedRemovedOptionIds,
      });
    }

    session.hintUsedCount += dto.count;
    session.coinsSpent += cost;
    await session.save();

    return {
      sessionId: session.id,
      questionId: dto.questionId,
      removedOptionIds: updatedRemovedOptionIds,
      newlyRemovedOptionIds,
      coinsSpent: cost,
      totalCoinsSpent: session.coinsSpent,
      remainingCoins: userUpdate.coins,
    };
  }

  async finishSession(userId: string, sessionId: string) {
    const session = await this.findUserSession(userId, sessionId);
    if (session.status === SessionStatus.Finished) {
      return this.toFinishResponse(session, await this.getRank(session));
    }

    session.status = SessionStatus.Finished;
    const now = new Date();
    session.finishedAt =
      session.mode === QuizMode.Ranked &&
      session.expiresAt &&
      now > session.expiresAt
        ? session.expiresAt
        : now;
    await session.save();

    if (session.mode === QuizMode.Ranked) {
      await this.userModel.updateOne(
        { id: userId },
        { $inc: { totalScore: session.score } },
      );
    }

    let buildingProgress: {
      buildingId: string;
      isCompleted: boolean;
      bestScore: number;
    } | null = null;

    if (session.mode === QuizMode.Building && session.buildingId) {
      buildingProgress = await this.updateBuildingProgress(session);
    }

    return this.toFinishResponse(
      session,
      await this.getRank(session),
      buildingProgress,
    );
  }

  async getRank(session: QuizSession): Promise<number | null> {
    if (
      session.mode !== QuizMode.Ranked ||
      session.status !== SessionStatus.Finished
    ) {
      return null;
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
    const index = sorted.findIndex((item) => item.id === session.id);

    return index >= 0 ? index + 1 : null;
  }

  getTimeUsedSeconds(session: QuizSession): number {
    const end = session.finishedAt ?? new Date();
    return Math.max(
      0,
      Math.round(
        (new Date(end).getTime() - new Date(session.startedAt).getTime()) /
          1000,
      ),
    );
  }

  getAccuracy(correctCount: number, incorrectCount: number): number {
    const answered = correctCount + incorrectCount;
    return answered > 0 ? correctCount / answered : 0;
  }

  private async findUserSession(
    userId: string,
    sessionId: string,
  ): Promise<QuizSessionDocument> {
    const session = await this.quizSessionModel
      .findOne({ id: sessionId, userId })
      .exec();
    if (!session) {
      throw new NotFoundException('Quiz session not found');
    }

    return session;
  }

  private async updateBuildingProgress(session: QuizSessionDocument) {
    const correctQuestionIds = new Set(
      session.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.questionId),
    );
    const correctCount = correctQuestionIds.size;
    const totalQuestions = session.questionIds.length;
    const isCompleted = totalQuestions > 0 && correctCount >= totalQuestions;

    const existing = await this.progressModel
      .findOne({ userId: session.userId, buildingId: session.buildingId })
      .exec();
    const bestScore = Math.max(existing?.bestScore ?? 0, session.score);
    const completedAt =
      isCompleted && !existing?.isCompleted
        ? session.finishedAt
        : existing?.completedAt;
    const building = session.buildingId
      ? await this.buildingsService.findActiveById(session.buildingId)
      : null;
    const coinsAwarded =
      isCompleted && !existing?.isCompleted
        ? (building?.completionCoinReward ?? 0)
        : 0;

    await this.progressModel.updateOne(
      { userId: session.userId, buildingId: session.buildingId },
      {
        $set: {
          isUnlocked: true,
          isCompleted,
          bestScore,
          correctCount,
          totalQuestions,
          completedAt,
          lastPlayedAt: session.finishedAt,
        },
        $inc: { coinsAwarded },
        $setOnInsert: {
          unlockedAt: session.startedAt,
        },
      },
      { upsert: true },
    );

    if (coinsAwarded > 0) {
      await this.userModel.updateOne(
        { id: session.userId },
        { $inc: { coins: coinsAwarded } },
      );
    }

    if (isCompleted && session.buildingId) {
      const currentBuilding =
        building ??
        (await this.buildingsService.findActiveById(session.buildingId));
      const nextBuilding =
        await this.buildingsService.findNextActiveByUnlockOrder(
          currentBuilding.unlockOrder,
        );

      if (nextBuilding) {
        await this.progressModel.updateOne(
          { userId: session.userId, buildingId: nextBuilding.id },
          {
            $set: { isUnlocked: true },
            $setOnInsert: {
              isCompleted: false,
              bestScore: 0,
              correctCount: 0,
              totalQuestions: 0,
              coinsAwarded: 0,
              unlockedAt: session.finishedAt,
              completedAt: null,
              lastPlayedAt: null,
            },
          },
          { upsert: true },
        );
      }
    }

    return {
      buildingId: session.buildingId ?? '',
      isCompleted,
      bestScore,
      coinsAwarded,
    };
  }

  private getRemovedOptionIds(
    session: QuizSessionDocument,
    questionId: string,
  ): string[] {
    const eliminatedOptions = session.eliminatedOptions ?? [];

    return (
      eliminatedOptions.find((item) => item.questionId === questionId)
        ?.removedOptionIds ?? []
    );
  }

  private toFinishResponse(
    session: QuizSession,
    rank: number | null,
    buildingProgress?: {
      buildingId: string;
      isCompleted: boolean;
      bestScore: number;
    } | null,
  ) {
    return {
      sessionId: session.id,
      mode: session.mode,
      status: session.status,
      ...(session.buildingId ? { buildingId: session.buildingId } : {}),
      score: session.score,
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      totalQuestions: session.totalQuestions,
      attemptedCount: session.attemptedCount,
      accuracy: this.getAccuracy(session.correctCount, session.incorrectCount),
      timeUsedSeconds: this.getTimeUsedSeconds(session),
      hintUsedCount: session.hintUsedCount,
      hintLimit: session.hintLimit,
      coinsSpent: session.coinsSpent,
      bestStreak: session.bestStreak,
      rank,
      ...(buildingProgress ? { buildingProgress } : {}),
      finishedAt: session.finishedAt,
    };
  }
}
