import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { AuthGuard } from './guards/auth.guard';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async signup(@Body() dto: SignupDto, @Request() req, @Response() res) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const token = await this.authService.signup({ dto, ipAddress, userAgent });
    return res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000,
    });
  }

  @Post('signin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign in and receive access token as cookie' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({
    status: 200,
    description: 'Sets httpOnly accessToken cookie and returns user info',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async signin(@Body() dto: SigninDto, @Response() res, @Request() req) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const token = await this.authService.signin({ dto, ipAddress, userAgent });
    return res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000,
    });
  }

  @Post('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Get currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the logged-in user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid token',
  })
  async me(@Request() req) {
    return this.authService.me(req.userId);
  }
}
