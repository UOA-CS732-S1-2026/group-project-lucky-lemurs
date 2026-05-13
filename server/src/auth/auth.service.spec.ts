import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { signAsync: jest.Mock };
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    findByUsername: jest.Mock;
    recordLogin: jest.Mock;
    toPublicUser: jest.Mock;
  };

  const user = {
    id: 'user_1',
    username: 'tester',
    email: 'tester@example.com',
    passwordHash: 'hashed-password',
  };
  const publicUser = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  beforeEach(async () => {
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };
    usersService = {
      create: jest.fn().mockResolvedValue(user),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByUsername: jest.fn().mockResolvedValue(null),
      recordLogin: jest.fn().mockResolvedValue(undefined),
      toPublicUser: jest.fn().mockReturnValue(publicUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a new user and returns a public user with a token', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await service.register({
      username: 'tester',
      email: 'tester@example.com',
      password: 'password123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('tester@example.com');
    expect(usersService.findByUsername).toHaveBeenCalledWith('tester');
    expect(usersService.create).toHaveBeenCalledWith({
      username: 'tester',
      email: 'tester@example.com',
      passwordHash: 'hashed-password',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
    expect(result).toEqual({ user: publicUser, accessToken: 'signed-token' });
  });

  it('rejects registration when the email is already used', async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      service.register({
        username: 'tester',
        email: 'tester@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('rejects registration when the username is already used', async () => {
    usersService.findByUsername.mockResolvedValue(user);

    await expect(
      service.register({
        username: 'tester',
        email: 'tester@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('logs in a user with a valid password', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      email: 'tester@example.com',
      password: 'password123',
    });

    expect(usersService.recordLogin).toHaveBeenCalledWith(user.id);
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
    expect(result).toEqual({ user: publicUser, accessToken: 'signed-token' });
  });

  it('rejects login for an unknown email', async () => {
    await expect(
      service.login({ email: 'missing@example.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.recordLogin).not.toHaveBeenCalled();
  });

  it('rejects login for an invalid password', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'tester@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.recordLogin).not.toHaveBeenCalled();
  });
});
