import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Request,
  UseGuards,
  Headers,
  Response,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { AuthGuard } from './guards/auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
// sameSite: 'none' is the only value that allows cookies across different origins
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite:
    process.env.NODE_ENV === 'production'
      ? ('none' as const) // cross-origin needs 'none'
      : ('lax' as const),
  maxAge: 7 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User registered, cookie set' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signup(@Body() dto: SignupDto, @Request() req, @Response() res) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const token = await this.authService.signup({ dto, ipAddress, userAgent });

    res.cookie('accessToken', token, COOKIE_OPTIONS);

    return res.json({ message: 'User registered successfully' });
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in and set access token cookie' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({ status: 200, description: 'Signin successful, cookie set' })
  async signin(@Body() dto: SigninDto, @Request() req, @Response() res) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const token = await this.authService.signin({ dto, ipAddress, userAgent });

    res.cookie('accessToken', token, COOKIE_OPTIONS);

    return res.json({ message: 'Signin successful' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the logged-in user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid token',
    schema: {
      example: {
        name: 'Subham Dey',
        age: 25,
        gender: 'MALE',
        city: 'mumbai',
        interests: ['hiking', 'chess', 'cooking'],
        photoUrl: 'https://example.com/photo.jpg',
        preferredGender: 'MALE',
        preferredAgeMin: 21,
        preferredAgeMax: 30,
      },
    },
  })
  async me(@Request() req) {
    return this.authService.me(req.userId);
  }
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear access token cookie' })
  async logout(@Response() res) {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    return res.json({ message: 'Logged out successfully' });
  }
}
