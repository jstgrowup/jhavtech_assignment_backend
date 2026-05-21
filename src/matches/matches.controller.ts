import { Controller } from '@nestjs/common';
import { Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

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
  getTopMatches(@Request() req) {
    return this.matchesService.getTopMatches(req.user._id);
  }
}
