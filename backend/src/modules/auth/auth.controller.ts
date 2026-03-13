import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { OrgGuard } from "./guards/org.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags('Auth')
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'User login', description: 'Authenticate user and return JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limit exceeded' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user', description: 'Get current authenticated user information (JWT only)' })
  @ApiResponse({ status: 200, description: 'User information returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  me(@CurrentUser() user: any) {
    return { user };
  }

  @UseGuards(JwtAuthGuard, OrgGuard)
  @Get("me-in-org")
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('x-org-id')
  @ApiOperation({ summary: 'Get user in org context', description: 'Get user with organization validation (JWT + x-org-id header)' })
  @ApiResponse({ status: 200, description: 'User information with org context' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 400, description: 'Bad Request - missing x-org-id header' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not a member of this organization' })
  meInOrg(@CurrentUser() user: any) {
    return { user, note: "x-org-id validated" };
  }
}