import { Injectable, UnauthorizedException } from '@nestjs/common';

import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../user/user.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    // private readonly sessionService: SessionsService,
    private readonly jwtService: JwtService,
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
    // return this.sessionService.createSession({
    //   userId: user.id.toString(),
    //   ipAddress,
    //   userAgent,
    // });
    return this.jwtService.signAsync({
      sub: user._id,
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

    // return this.sessionService.createSession({
    //   userId: user.id.toString(),
    //   ipAddress,
    //   userAgent,
    // });
    return this.jwtService.signAsync({
      sub: user._id,
    });
  }

  async me(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid userId');
    }

    return { data: user };
  }
  // async logout(rawToken: string): Promise<void> {
  //   return this.sessionService.deleteSession(rawToken);
  // }
}
