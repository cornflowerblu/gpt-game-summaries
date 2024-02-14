import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let executionContext: ExecutionContext;

  beforeEach(() => {
    authGuard = new AuthGuard();
    executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': 'valid-api-key' } }),
      }),
    } as any;
  });

  // gotta figure out how to do this w/o invariant.. etc.
  //   it('should allow a request with a valid API key to proceed', () => {
  //     expect(authGuard.canActivate(executionContext)).toThrow();
  //   });

  it('should throw an exception for a request with an invalid API key', () => {
    executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': 'invalid-api-key' } }),
      }),
    } as any;

    expect(() => authGuard.canActivate(executionContext)).toThrow();
  });
});
