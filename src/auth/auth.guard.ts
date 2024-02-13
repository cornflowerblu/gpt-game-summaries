import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    this.validateRequest(request);
    return true;
  }

  private validateRequest(request: any): void {
    const apiKey = request.headers['x-api-key'];

    const validApiKey = process.env.API_KEY;

    process.env.NODE_ENV === 'production'
      ? invariant(validApiKey, 'Missing API Key')
      : null;

    if (!apiKey || apiKey !== validApiKey) {
      throw new HttpException(
        'Invalid or Missing API Key',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
