import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizMode, SessionStatus } from '../common/enums';
import { QuizSession } from '../quiz/schemas/quiz-session.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserBuildingProgress } from './schemas/user-building-progress.schema';
import { User, UserDocument } from './schemas/user.schema';

interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(QuizSession.name)
    private readonly quizSessionModel: Model<QuizSession>,
    @InjectModel(UserBuildingProgress.name)
    private readonly progressModel: Model<UserBuildingProgress>,
  ) {}

  create(input: CreateUserInput): Promise<UserDocument> {
    return this.userModel.create(input);
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id }).exec();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      totalScore: user.totalScore,
    };
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [sessions, progress, rankedSessions] = await Promise.all([
      this.quizSessionModel
        .find({ userId, status: SessionStatus.Finished })
        .lean()
        .exec(),
      this.progressModel.find({ userId, isCompleted: true }).lean().exec(),
      this.quizSessionModel
        .find({ mode: QuizMode.Ranked, status: SessionStatus.Finished })
        .sort({ score: -1, timeLimitSeconds: 1, finishedAt: 1 })
        .lean()
        .exec(),
    ]);

    const totalCorrect = sessions.reduce(
      (sum, session) => sum + session.correctCount,
      0,
    );
    const totalAnswered = sessions.reduce(
      (sum, session) => sum + session.correctCount + session.incorrectCount,
      0,
    );
    const rankIndex = rankedSessions.findIndex(
      (session) => session.userId === userId,
    );

    return {
      ...this.toPublicUser(user),
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      completedBuildingCount: progress.length,
      accuracy: totalAnswered > 0 ? totalCorrect / totalAnswered : 0,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    if (updateProfileDto.username) {
      const existing = await this.findByUsername(updateProfileDto.username);
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username is already taken');
      }
    }

    const user = await this.userModel
      .findOneAndUpdate({ id: userId }, updateProfileDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  async getProgress(userId: string) {
    const progress = await this.progressModel
      .find({ userId })
      .sort({ buildingId: 1 })
      .lean()
      .exec();

    return {
      userId,
      buildingProgress: progress.map((item) => ({
        buildingId: item.buildingId,
        isUnlocked: item.isUnlocked,
        isCompleted: item.isCompleted,
        bestScore: item.bestScore,
        correctCount: item.correctCount,
        totalQuestions: item.totalQuestions,
        lastPlayedAt: item.lastPlayedAt,
      })),
    };
  }
}
