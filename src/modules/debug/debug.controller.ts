import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DebugService } from './debug.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Debug')
@Controller('debug')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Get('me-orgs')
  @ApiOperation({ summary: 'Get user organizations', description: 'List all organizations the current user belongs to with their roles' })
  @ApiResponse({ status: 200, description: 'User organizations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  getMeOrgs(@CurrentUser() user: { id: string }) {
    return this.debugService.getUserOrgs(user.id);
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Database health check', description: 'Get database connection status and record counts for all main tables' })
  @ApiResponse({ status: 200, description: 'Database health information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  getDbHealth() {
    return this.debugService.getDbHealth();
  }
}
