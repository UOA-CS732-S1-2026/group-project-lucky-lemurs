import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BuildingsService } from './buildings.service';

@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesReviewController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get(':buildingId/review')
  getReview(@Param('buildingId') buildingId: string) {
    return this.buildingsService.getReview(buildingId);
  }
}
