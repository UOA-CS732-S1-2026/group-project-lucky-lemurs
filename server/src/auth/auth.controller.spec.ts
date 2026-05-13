import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates registration to AuthService', async () => {
    const dto = {
      username: 'tester',
      email: 'tester@example.com',
      password: 'password123',
    };
    const response = { user: { id: 'user_1' }, accessToken: 'token' };
    authService.register.mockResolvedValue(response);

    await expect(controller.register(dto)).resolves.toBe(response);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login to AuthService', async () => {
    const dto = { email: 'tester@example.com', password: 'password123' };
    const response = { user: { id: 'user_1' }, accessToken: 'token' };
    authService.login.mockResolvedValue(response);

    await expect(controller.login(dto)).resolves.toBe(response);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('returns a logout confirmation', () => {
    expect(controller.logout()).toEqual({ message: 'Logged out successfully' });
  });
});
