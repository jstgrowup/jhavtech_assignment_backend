import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MeDto } from './dto/me.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signup(dto: SignupDto) {
    await this.userService.createUser(dto.name, dto.email, dto.password);

    return {
      message: 'User created successfully',
    };
  }
  async signin(dto: SigninDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return await this.generateToken(user._id.toString());
  }
  private generateToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload);
  }

  async me(dto: MeDto) {
    const user = await this.userService.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid userId');
    }

    return await this.generateToken(user._id.toString());
  }
}
