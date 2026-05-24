import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchesController } from './matches/matches.controller';
import { MatchesModule } from './matches/matches.module';
import { SessionsModule } from './sessions/sessions.module';
import { LogModule } from './log/log.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MatchesModule,
    SessionsModule,
    LogModule,
  ],
  controllers: [AppController, MatchesController],
  providers: [AppService],
})
export class AppModule {}
