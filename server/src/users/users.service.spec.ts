import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QuizSession } from '../quiz/schemas/quiz-session.schema';
import { UserBuildingProgress } from './schemas/user-building-progress.schema';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const mockModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockModel },
        { provide: getModelToken(QuizSession.name), useValue: mockModel },
        {
          provide: getModelToken(UserBuildingProgress.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
