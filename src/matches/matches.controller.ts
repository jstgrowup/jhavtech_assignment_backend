import { Controller, Param, Post } from '@nestjs/common';
import { Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';

import { Action } from './schemas/match-action.schema';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Matches')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}
  @Get()
  @ApiOperation({ summary: 'Get top 10 compatibility scored matches' })
  @ApiResponse({
    status: 200,
    description: 'Returns top 10 users sorted by compatibility score',
    schema: {
      example: [
        {
          user: {
            _id: '665f...',
            name: 'Priya',
            age: 24,
            city: 'mumbai',
            interests: ['hiking', 'chess'],
          },
          compatibilityScore: 75,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTopMatches(@Request() req) {
    const response = await this.matchesService.getTopMatches(req.userId);

    return {
      data: response,
    };
  }
  @Post(':userId/like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Like a user profile' })
  @ApiParam({ name: 'userId', description: 'Target user MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Like recorded' })
  @ApiResponse({ status: 404, description: 'User not found' })
  like(@Request() req, @Param('userId') userId: string) {
    return this.matchesService.recordAction(req.userId, userId, Action.LIKE);
  }

  @Post(':userId/pass')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Pass on a user profile' })
  @ApiParam({ name: 'userId', description: 'Target user MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Pass recorded' })
  @ApiResponse({ status: 404, description: 'User not found' })
  pass(@Request() req, @Param('userId') userId: string) {
    return this.matchesService.recordAction(req.userId, userId, Action.PASS);
  }

  @Get('mutual')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get list of mutual matches' })
  @ApiResponse({
    status: 200,
    description: 'Returns users who liked each other',
  })
  async getMutualMatches(@Request() req) {
    const response = await this.matchesService.getMutualMatches(req.userId);
    return {
      data: response,
    };
  }
}
