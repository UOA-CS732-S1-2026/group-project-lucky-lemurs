import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Building } from '../buildings/schemas/building.schema';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(Building.name)
    private readonly buildingModel: Model<Building>,
  ) {}

  toSafeQuestion(question: Question) {
    return {
      id: question.id,
      buildingId: question.buildingId,
      category: question.category,
      difficulty: question.difficulty,
      questionText: question.questionText,
      options: question.options,
      imageUrl: question.imageUrl,
    };
  }

  async findById(questionId: string): Promise<QuestionDocument> {
    const question = await this.questionModel
      .findOne({ id: questionId, isActive: true })
      .exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async findRandomActive(limit: number): Promise<QuestionDocument[]> {
    return this.questionModel
      .aggregate<QuestionDocument>([
        { $match: { isActive: true } },
        { $sample: { size: limit } },
      ])
      .exec();
  }

  async findByBuildingId(buildingId: string): Promise<QuestionDocument[]> {
    const building = await this.buildingModel
      .findOne({ id: buildingId, isActive: true })
      .exec();
    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return this.questionModel
      .find({ buildingId, isActive: true })
      .sort({ category: 1, id: 1 })
      .exec();
  }

  countByBuildingId(buildingId: string): Promise<number> {
    return this.questionModel.countDocuments({ buildingId, isActive: true });
  }
}
