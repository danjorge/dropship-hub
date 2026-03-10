import { Controller, Get, Post, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { Provider } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../../auth/guards/org.guard';
import { OrgId } from '../../auth/decorators/org-id.decorator';
import { IntegrationsService } from '../integrations.service';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, OrgGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('x-org-id')
  @ApiOperation({
    summary: 'Get integrations status',
    description: 'Get connection status for all supported marketplace providers. Returns all providers even if not connected.',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              provider: { type: 'string', enum: ['SHOPEE', 'MERCADOLIVRE'] },
              status: { type: 'string' },
              isConnected: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - only MERCHANT orgs can access' })
  getIntegrationsStatus(@OrgId() orgId: string) {
    return this.integrationsService.getIntegrationsStatus(orgId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrgGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('x-org-id')
  @ApiOperation({
    summary: 'Get integrations',
    description: 'List all marketplace integrations for the current organization',
  })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  getIntegrations(@OrgId() orgId: string) {
    return this.integrationsService.getIntegrations(orgId);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, OrgGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('x-org-id')
  @ApiOperation({
    summary: 'Get active integrations',
    description: 'List only ACTIVE marketplace integrations for the current organization',
  })
  @ApiResponse({ status: 200, description: 'Active integrations retrieved successfully' })
  getActiveIntegrations(@OrgId() orgId: string) {
    return this.integrationsService.getActiveIntegrations(orgId);
  }

  @Post(':provider/connect')
  @UseGuards(JwtAuthGuard, OrgGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('x-org-id')
  @ApiOperation({
    summary: 'Start integration connection',
    description: 'Initiate OAuth flow for marketplace integration. Returns authUrl for redirect.',
  })
  @ApiParam({
    name: 'provider',
    enum: Provider,
    description: 'Marketplace provider to connect',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration flow started successfully',
    schema: {
      type: 'object',
      properties: {
        provider: { type: 'string' },
        status: { type: 'string' },
        authUrl: { type: 'string' },
        integrationId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid provider or configuration error' })
  @ApiResponse({ status: 403, description: 'Forbidden - only MERCHANT orgs can connect' })
  async connectIntegration(
    @OrgId() orgId: string,
    @Param('provider') provider: Provider,
  ) {
    return this.integrationsService.startIntegration(orgId, provider);
  }

  @Post(':provider/disconnect')
  @UseGuards(JwtAuthGuard, OrgGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('x-org-id')
  @ApiOperation({
    summary: 'Disconnect integration',
    description: 'Disconnect and deactivate marketplace integration',
  })
  @ApiParam({
    name: 'provider',
    enum: Provider,
    description: 'Marketplace provider to disconnect',
  })
  @ApiResponse({ status: 200, description: 'Integration disconnected successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - integration not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - only MERCHANT orgs can disconnect' })
  async disconnectIntegration(
    @OrgId() orgId: string,
    @Param('provider') provider: Provider,
  ) {
    return this.integrationsService.disconnectIntegration(orgId, provider);
  }

  @Get('shopee/callback')
  @ApiOperation({
    summary: 'Shopee OAuth callback',
    description: 'Handle OAuth callback from Shopee. Exchanges code for access token and redirects to frontend.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to frontend integrations page' })
  async shopeeCallback(@Query() query: any, @Res() res: Response) {
    try {
      const { orgId, success } = await this.integrationsService.handleCallback(
        Provider.SHOPEE,
        query,
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/integrations?provider=SHOPEE&connected=${success}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/integrations?provider=SHOPEE&connected=false&error=${encodeURIComponent(error.message)}`;

      return res.redirect(redirectUrl);
    }
  }

  @Get('mercadolivre/callback')
  @ApiOperation({
    summary: 'Mercado Livre OAuth callback',
    description: 'Handle OAuth callback from Mercado Livre. Exchanges code for access token and redirects to frontend.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to frontend integrations page' })
  async mercadoLivreCallback(@Query() query: any, @Res() res: Response) {
    try {
      const { orgId, success } = await this.integrationsService.handleCallback(
        Provider.MERCADOLIVRE,
        query,
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/integrations?provider=MERCADOLIVRE&connected=${success}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/integrations?provider=MERCADOLIVRE&connected=false&error=${encodeURIComponent(error.message)}`;

      return res.redirect(redirectUrl);
    }
  }
}
