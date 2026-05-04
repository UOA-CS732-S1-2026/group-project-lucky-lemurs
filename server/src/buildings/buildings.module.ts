import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import {
  UserBuildingProgress,
  UserBuildingProgressSchema,
} from '../users/schemas/user-building-progress.schema';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { Building, BuildingSchema } from './schemas/building.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Building.name, schema: BuildingSchema },
      { name: Question.name, schema: QuestionSchema },
      {
        name: UserBuildingProgress.name,
        schema: UserBuildingProgressSchema,
      },
    ]),
  ],
  controllers: [BuildingsController],
  providers: [BuildingsService],
  exports: [BuildingsService],
})
export class BuildingsModule {}
