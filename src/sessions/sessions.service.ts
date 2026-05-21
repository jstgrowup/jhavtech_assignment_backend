import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<SessionDocument>,
  ) {}

  async createSession({
    userId,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<string> {
    const sessionId = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionModel.create({
      token: sessionId,
      userId: userId as any,
      ipAddress,
      userAgent,
      expiresAt,
    });
    return sessionId;
  }
  async validateSession(incomingToken: string): Promise<string> {
    const session = await this.sessionModel.findOne({ token: incomingToken });

    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    return String(session.userId);
  }
}
