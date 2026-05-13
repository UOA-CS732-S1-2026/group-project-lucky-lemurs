import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { AuthService } from '../src/auth/auth.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('Lucky Lemurs API (e2e)', () => {
  let app: INestApplication<App>;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };
  let usersService: {
    getProfile: jest.Mock;
    updateProfile: jest.Mock;
    getProgress: jest.Mock;
  };

  const publicUser = {
    id: 'user_1',
    username: 'tester',
    email: 'tester@example.com',
    avatarUrl: '/images/avatars/default.png',
    totalScore: 20,
    coins: 4,
    currentStreak: 1,
    bestStreak: 3,
    strongestCategory: null,
    badges: [],
  };

  const authGuard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<{
        headers: Record<string, string | undefined>;
        user?: { id: string; email: string; username: string };
      }>();

      if (request.headers.authorization !== 'Bearer test-token') {
        throw new UnauthorizedException();
      }

      request.user = {
        id: publicUser.id,
        email: publicUser.email,
        username: publicUser.username,
      };
      return true;
    },
  };

  beforeAll(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };
    usersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      getProgress: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, UsersController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(authGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth routes', () => {
    it('POST /auth/register registers a user and returns an access token', async () => {
      authService.register.mockResolvedValue({
        user: publicUser,
        accessToken: 'test-token',
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'tester',
          email: 'tester@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect({
          user: publicUser,
          accessToken: 'test-token',
        });

      expect(authService.register).toHaveBeenCalledWith({
        username: 'tester',
        email: 'tester@example.com',
        password: 'password123',
      });
    });

    it('POST /auth/register validates the request body', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'tester',
          email: 'not-an-email',
          password: 'short',
        })
        .expect(400);

      expect(authService.register).not.toHaveBeenCalled();
    });

    it('POST /auth/login logs in and returns an access token', async () => {
      authService.login.mockResolvedValue({
        user: publicUser,
        accessToken: 'test-token',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'tester@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect({
          user: publicUser,
          accessToken: 'test-token',
        });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'tester@example.com',
        password: 'password123',
      });
    });

    it('POST /auth/logout returns a logout confirmation', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201)
        .expect({ message: 'Logged out successfully' });
    });
  });

  describe('protected user routes', () => {
    it('GET /users/me rejects requests without a bearer token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
      expect(usersService.getProfile).not.toHaveBeenCalled();
    });

    it('GET /users/me returns the current user profile', async () => {
      usersService.getProfile.mockResolvedValue({
        ...publicUser,
        rank: 2,
        completedBuildingCount: 1,
        accuracy: 0.75,
      });

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .expect({
          ...publicUser,
          rank: 2,
          completedBuildingCount: 1,
          accuracy: 0.75,
        });

      expect(usersService.getProfile).toHaveBeenCalledWith(publicUser.id);
    });

    it('PATCH /users/me updates the current user profile', async () => {
      usersService.updateProfile.mockResolvedValue({
        id: publicUser.id,
        username: 'updated',
        email: publicUser.email,
        avatarUrl: '/images/avatars/default.png',
      });

      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', 'Bearer test-token')
        .send({ username: 'updated' })
        .expect(200)
        .expect({
          id: publicUser.id,
          username: 'updated',
          email: publicUser.email,
          avatarUrl: '/images/avatars/default.png',
        });

      expect(usersService.updateProfile).toHaveBeenCalledWith(publicUser.id, {
        username: 'updated',
      });
    });

    it('GET /users/me/progress returns building progress for the current user', async () => {
      usersService.getProgress.mockResolvedValue({
        userId: publicUser.id,
        buildingProgress: [
          {
            buildingId: 'clocktower',
            isUnlocked: true,
            isCompleted: true,
            bestScore: 30,
            correctCount: 3,
            totalQuestions: 3,
            coinsAwarded: 5,
            unlockedAt: '2026-01-01T00:00:00.000Z',
            completedAt: '2026-01-02T00:00:00.000Z',
            lastPlayedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/users/me/progress')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .expect({
          userId: publicUser.id,
          buildingProgress: [
            {
              buildingId: 'clocktower',
              isUnlocked: true,
              isCompleted: true,
              bestScore: 30,
              correctCount: 3,
              totalQuestions: 3,
              coinsAwarded: 5,
              unlockedAt: '2026-01-01T00:00:00.000Z',
              completedAt: '2026-01-02T00:00:00.000Z',
              lastPlayedAt: '2026-01-02T00:00:00.000Z',
            },
          ],
        });

      expect(usersService.getProgress).toHaveBeenCalledWith(publicUser.id);
    });
  });
});
