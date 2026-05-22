import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/updateprofile.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return this.userService.findById(req.userId);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.userId, dto);
  }
}
