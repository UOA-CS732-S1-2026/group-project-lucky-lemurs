import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/auth-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { BuildingsService } from './buildings.service';

@UseGuards(JwtAuthGuard)
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.buildingsService.findAllForUser(user.id);
  }

  @Get(':buildingId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('buildingId') buildingId: string,
  ) {
    return this.buildingsService.findOneForUser(buildingId, user.id);
  }

  @Post(':buildingId/unlock')
  unlockWithCoins(
    @CurrentUser() user: AuthUser,
    @Param('buildingId') buildingId: string,
  ) {
    return this.buildingsService.unlockBuildingWithCoins(user.id, buildingId);
  }
  @Get(':buildingId/review')
  getReview(@Param('buildingId') buildingId: string) {
    return this.buildingsService.getReview(buildingId);
  }
}
