import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from '../questions/schemas/question.schema';
import { UserBuildingProgress } from '../users/schemas/user-building-progress.schema';
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

  toBuildingResponse(
    building: Building,
    questionCount: number,
    progress?: UserBuildingProgress | null,
  ) {
    return {
      id: building.id,
      name: building.name,
      shortName: building.shortName,
      description: building.description,
      location: building.location,
      imageUrl: building.imageUrl,
      unlockOrder: building.unlockOrder,
      questionCount,
      isUnlocked: progress?.isUnlocked ?? building.unlockOrder === 1,
      isCompleted: progress?.isCompleted ?? false,
    };
  }
}
