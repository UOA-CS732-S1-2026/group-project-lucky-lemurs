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
import { StartBuildingQuizDto } from './dto/start-building-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuizSession, QuizSessionDocument } from './schemas/quiz-session.schema';

const RANKED_QUESTION_LIMIT = 20;
const RANKED_TIME_LIMIT_SECONDS = 60;
const CORRECT_SCORE_DELTA = 10;

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

    const session = await this.quizSessionModel.create({
      userId,
      mode: QuizMode.Building,
      buildingId: building.id,
      questionIds: questions.map((question) => question.id),
      totalQuestions: questions.length,
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
    if (!question.options.some((option) => option.id === dto.selectedOptionId)) {
      throw new BadRequestException('selectedOptionId is invalid');
    }

    const alreadyCorrect = session.answers.some(
      (answer) => answer.questionId === dto.questionId && answer.isCorrect,
    );
    if (alreadyCorrect) {
      throw new ConflictException('Question has already been answered correctly');
    }

    if (
      session.mode === QuizMode.Ranked &&
      session.answers.some((answer) => answer.questionId === dto.questionId)
    ) {
      throw new ConflictException('Question has already been answered');
    }

    const correct = question.correctOptionId === dto.selectedOptionId;
    const scoreDelta = correct ? CORRECT_SCORE_DELTA : 0;
    session.answers.push({
      questionId: question.id,
      selectedOptionId: dto.selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect: correct,
      scoreDelta,
      timeSpentSeconds: dto.timeSpentSeconds,
      answeredAt: new Date(),
    });
    session.score += scoreDelta;
    if (correct) {
      session.correctCount += 1;
    } else {
      session.incorrectCount += 1;
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
      ...(session.mode === QuizMode.Building && !correct
        ? { retryLater: true }
        : {}),
    };
  }

  async finishSession(userId: string, sessionId: string) {
    const session = await this.findUserSession(userId, sessionId);
    if (session.status === SessionStatus.Finished) {
      return this.toFinishResponse(session, await this.getRank(session));
    }

    session.status = SessionStatus.Finished;
    session.finishedAt = new Date();
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
    if (session.mode !== QuizMode.Ranked || session.status !== SessionStatus.Finished) {
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

    await this.progressModel.updateOne(
      { userId: session.userId, buildingId: session.buildingId },
      {
        $set: {
          isUnlocked: true,
          isCompleted,
          bestScore,
          correctCount,
          totalQuestions,
          lastPlayedAt: session.finishedAt,
        },
      },
      { upsert: true },
    );

    return {
      buildingId: session.buildingId ?? '',
      isCompleted,
      bestScore,
    };
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
      accuracy: this.getAccuracy(session.correctCount, session.incorrectCount),
      timeUsedSeconds: this.getTimeUsedSeconds(session),
      rank,
      ...(buildingProgress ? { buildingProgress } : {}),
      finishedAt: session.finishedAt,
    };
  }
}
