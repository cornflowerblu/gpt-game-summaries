import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  const originalEnv = process.env;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    
    // Save original environment and set test API key
    process.env = { ...originalEnv };
    process.env.API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access with valid API key', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': 'test-api-key',
          },
        }),
      }),
    });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw unauthorized exception when API key is missing', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    });

    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
    expect(() => guard.canActivate(mockContext)).toThrow('Invalid or Missing API Key');
  });

  it('should throw unauthorized exception when API key is invalid', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': 'wrong-api-key',
          },
        }),
      }),
    });

    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
    expect(() => guard.canActivate(mockContext)).toThrow('Invalid or Missing API Key');
  });

  it('should not throw invariant error in non-production environment when API_KEY is missing', () => {
    // Set to development environment
    process.env.NODE_ENV = 'development';
    delete process.env.API_KEY;

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': undefined,
          },
        }),
      }),
    });

    // Should still throw HttpException but not invariant error
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
  });

  it('should throw invariant error in production environment when API_KEY is missing', () => {
    // Set to production environment
    process.env.NODE_ENV = 'production';
    delete process.env.API_KEY;

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': 'some-key',
          },
        }),
      }),
    });

    // Should throw invariant error
    expect(() => guard.canActivate(mockContext)).toThrow('Missing API Key');
  });
});