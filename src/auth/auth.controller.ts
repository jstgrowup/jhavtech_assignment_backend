import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Request,
  UseGuards,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signup(@Body() dto: SignupDto, @Request() req) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const token = await this.authService.signup({ dto, ipAddress, userAgent });
    return {
      message: 'User registered successfully',
      data: {
        token,
      },
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign in and receive access token' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({
    status: 200,
    description: 'Signin successfull',
    schema: {
      example: {
        token: 'jfhwrflqwr323',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async signin(@Body() dto: SigninDto, @Request() req) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const token = await this.authService.signin({ dto, ipAddress, userAgent });
    return {
      message: 'Signin successfull',
      data: {
        token,
      },
    };
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
}
