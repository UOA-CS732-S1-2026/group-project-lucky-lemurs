import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/auth-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';

@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getLeaderboard(
    @CurrentUser() user: AuthUser,
    @Query('mode') mode = 'ranked',
    @Query('period') period = 'all',
  ) {
    return this.leaderboardService.getLeaderboard(user.id, mode, period);
  }
}
