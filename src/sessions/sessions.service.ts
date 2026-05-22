import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { createHash, randomUUID } from 'crypto';

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
    const rawToken = randomUUID();
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 7);

    await this.sessionModel.create({
      token: hashedToken,
      userId: userId as any,
      ipAddress,
      userAgent,
      expiresAt,
    });
    return rawToken;
  }
  async validateSession(incomingToken: string): Promise<string> {
    const hashedIncoming = createHash('sha256')
      .update(incomingToken)
      .digest('hex');
    const session = await this.sessionModel.findOne({ token: hashedIncoming });
    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    return String(session.userId);
  }
  async deleteSession(incomingToken: string): Promise<void> {
    const hashedToken = createHash('sha256')
      .update(incomingToken)
      .digest('hex');

    // 2. Find and delete the session document
    const result = await this.sessionModel.deleteOne({ token: hashedToken });

    // 3. If no document was deleted, the token was already invalid/expired
    if (result.deletedCount === 0) {
      throw new UnauthorizedException('Session is invalid or already expired');
    }
  }
}
