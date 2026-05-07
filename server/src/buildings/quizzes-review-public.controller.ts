import { Controller, Get, Param } from '@nestjs/common';
import { BuildingsService } from './buildings.service';

@Controller('quizzes')
export class QuizzesReviewPublicController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get(':buildingId/review')
  getReview(@Param('buildingId') buildingId: string) {
    return this.buildingsService.getReview(buildingId);
  }
}
