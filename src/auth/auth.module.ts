import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  controllers: [],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
