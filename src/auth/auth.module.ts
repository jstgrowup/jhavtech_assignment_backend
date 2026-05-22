import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '7h' },
    }),
    UserModule,
    SessionsModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
