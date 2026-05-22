import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
  ) {}
  async signup({
    dto,
    ipAddress,
    userAgent,
  }: {
    dto: SignupDto;
    ipAddress: string;
    userAgent: string;
  }): Promise<string> {
    const user = await this.userService.createUser(
      dto.name,
      dto.email,
      dto.password,
    );
    return this.sessionService.createSession({
      userId: user.id.toString(),
      ipAddress,
      userAgent,
    });
  }
  async signin({
    dto,
    ipAddress,
    userAgent,
  }: {
    dto: SigninDto;
    ipAddress: string;
    userAgent: string;
  }) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.sessionService.createSession({
      userId: user.id.toString(),
      ipAddress,
      userAgent,
    });
  }

  async me(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid userId');
    }

    return { data: user };
  }
  async logout(rawToken: string): Promise<void> {
    return this.sessionService.deleteSession(rawToken);
  }
}
