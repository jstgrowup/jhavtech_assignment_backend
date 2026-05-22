import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchAction, MatchActionSchema } from './schemas/match-action.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    UserModule,
    SessionsModule,
    MongooseModule.forFeature([
      { name: MatchAction.name, schema: MatchActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
