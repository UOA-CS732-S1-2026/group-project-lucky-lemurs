import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from '../questions/schemas/question.schema';
import { UserBuildingProgress } from '../users/schemas/user-building-progress.schema';
import { User } from '../users/schemas/user.schema';
import { Building } from './schemas/building.schema';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: Model<Building>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(UserBuildingProgress.name)
    private readonly progressModel: Model<UserBuildingProgress>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findAllForUser(userId: string) {
    const [buildings, progress] = await Promise.all([
      this.buildingModel
        .find({ isActive: true })
        .sort({ unlockOrder: 1 })
        .exec(),
      this.progressModel.find({ userId }).lean().exec(),
    ]);
    const progressByBuilding = new Map(
      progress.map((item) => [item.buildingId, item]),
    );

    const buildingItems = await Promise.all(
      buildings.map(async (building) => {
        const questionCount = await this.questionModel.countDocuments({
          buildingId: building.id,
          isActive: true,
        });
        const itemProgress = progressByBuilding.get(building.id);

        return this.toBuildingResponse(building, questionCount, itemProgress);
      }),
    );

    return { buildings: buildingItems };
  }

  async findOneForUser(buildingId: string, userId: string) {
    const building = await this.findActiveById(buildingId);
    const [questionCount, progress] = await Promise.all([
      this.questionModel.countDocuments({ buildingId, isActive: true }),
      this.progressModel.findOne({ userId, buildingId }).lean().exec(),
    ]);

    return this.toBuildingResponse(building, questionCount, progress);
  }

  async getReview(buildingId: string) {
    const building = await this.findActiveById(buildingId);

    return building.reviewItems.map((item) => ({
      id: item.id,
      topic: item.topic,
      question: item.question,
      answer: item.answer,
      details: item.details,
      imageUrls: building.reviewImageUrls ?? [],
    }));
  }

  async findActiveById(buildingId: string) {
    const building = await this.buildingModel
      .findOne({ id: buildingId, isActive: true })
      .exec();
    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

  findNextActiveByUnlockOrder(unlockOrder: number) {
    return this.buildingModel
      .findOne({ isActive: true, unlockOrder: { $gt: unlockOrder } })
      .sort({ unlockOrder: 1 })
      .exec();
  }

  async unlockBuildingWithCoins(userId: string, buildingId: string) {
    const building = await this.findActiveById(buildingId);
    const [progress, completedBuildingCount] = await Promise.all([
      this.progressModel.findOne({ userId, buildingId }).lean().exec(),
      this.progressModel.countDocuments({ userId, isCompleted: true }).exec(),
    ]);
    const isUnlocked = progress?.isUnlocked ?? building.unlockOrder === 1;

    if (isUnlocked) {
      throw new BadRequestException('Building is already unlocked');
    }

    const unlockCost = this.calculateUnlockCost(
      building.unlockOrder,
      completedBuildingCount,
    );
    const userUpdate = await this.userModel
      .findOneAndUpdate(
        { id: userId, coins: { $gte: unlockCost } },
        { $inc: { coins: -unlockCost } },
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

    await this.progressModel.updateOne(
      { userId, buildingId },
      {
        $set: { isUnlocked: true },
        $setOnInsert: {
          isCompleted: false,
          bestScore: 0,
          correctCount: 0,
          totalQuestions: 0,
          coinsAwarded: 0,
          unlockedAt: new Date(),
          completedAt: null,
          lastPlayedAt: null,
        },
      },
      { upsert: true },
    );

    return {
      buildingId,
      isUnlocked: true,
      coinsSpent: unlockCost,
      remainingCoins: userUpdate.coins,
    };
  }

  calculateUnlockCost(unlockOrder: number, completedBuildingCount: number) {
    const lockedDistance = Math.max(0, unlockOrder - completedBuildingCount);
    return lockedDistance * 22;
  }

  toBuildingResponse(
    building: Building,
    questionCount: number,
    progress?: UserBuildingProgress | null,
  ) {
    const primaryImageUrl = building.reviewImageUrls?.[0] ?? building.imageUrl;

    return {
      id: building.id,
      name: building.name,
      shortName: building.shortName,
      description: building.description,
      location: building.location,
      imageUrl: primaryImageUrl,
      reviewImageUrls: building.reviewImageUrls ?? [],
      unlockOrder: building.unlockOrder,
      questionCount,
      isUnlocked: progress?.isUnlocked ?? building.unlockOrder === 1,
      isCompleted: progress?.isCompleted ?? false,
    };
  }
}
