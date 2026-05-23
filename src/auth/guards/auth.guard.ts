import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { SessionsService } from '../../sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    // private readonly sessionService: SessionsService
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.['accessToken'];

    if (!token) {
      throw new UnauthorizedException('No token provided in cookies');
    }
    try {
      // const userId = await this.sessionService.validateSession(token);
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      request.userId = userId;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
