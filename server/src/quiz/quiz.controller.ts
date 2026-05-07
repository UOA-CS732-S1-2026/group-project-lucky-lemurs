import { Body, Controller, Param, Post, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/auth-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { EliminateOptionsDto } from './dto/eliminate-options.dto';
import { StartBuildingQuizDto } from './dto/start-building-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuizService } from './quiz.service';

@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('modes')
  getModes() {
    return this.quizService.getModes();
  }

  @Post('ranked/start')
  startRanked(@CurrentUser() user: AuthUser) {
    return this.quizService.startRanked(user.id);
  }

  @Post('building/start')
  startBuilding(
    @CurrentUser() user: AuthUser,
    @Body() startBuildingQuizDto: StartBuildingQuizDto,
  ) {
    return this.quizService.startBuilding(user.id, startBuildingQuizDto);
  }

  @Post('sessions/:sessionId/answers')
  submitAnswer(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.quizService.submitAnswer(user.id, sessionId, submitAnswerDto);
  }

  @Post('sessions/:sessionId/eliminate-options')
  eliminateOptions(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() eliminateOptionsDto: EliminateOptionsDto,
  ) {
    return this.quizService.eliminateOptions(
      user.id,
      sessionId,
      eliminateOptionsDto,
    );
  }

  @Post('sessions/:sessionId/finish')
  finishSession(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.quizService.finishSession(user.id, sessionId);
  }
}
