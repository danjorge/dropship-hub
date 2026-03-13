import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { OrgId } from '../auth/decorators/org-id.decorator';
import { CreateListingDto } from './dto/create-listing.dto';
import { GetListingsDto } from './dto/get-listings.dto';

@ApiTags('Listings')
@Controller('listings')
@UseGuards(JwtAuthGuard, OrgGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('x-org-id')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create listing', 
    description: 'Create a marketplace listing from a supplier offer (MERCHANT org only). Provider must be connected and active.' 
  })
  @ApiResponse({ status: 201, description: 'Listing created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - provider not connected or not active' })
  @ApiResponse({ status: 403, description: 'Forbidden - only MERCHANT orgs can create listings or no approved relationship with supplier' })
  @ApiResponse({ status: 404, description: 'Supplier offer not found' })
  createListing(@OrgId() orgId: string, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(orgId, dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get listings', 
    description: 'List marketplace listings filtered by connected integrations. Only shows listings for providers with ACTIVE integrations. Supports filtering by provider, status, and search.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Listings retrieved successfully. Returns available providers and filtered items.',
    schema: {
      type: 'object',
      properties: {
        providers: {
          type: 'array',
          items: { type: 'string', enum: ['SHOPEE', 'MERCADOLIVRE'] },
          description: 'Available providers (connected integrations)',
        },
        items: {
          type: 'array',
          description: 'Filtered listings',
        },
        total: {
          type: 'number',
          description: 'Total count of filtered listings',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - provider filter not connected' })
  @ApiResponse({ status: 403, description: 'Forbidden - only MERCHANT orgs can access listings' })
  getListings(@OrgId() orgId: string, @Query() filters: GetListingsDto) {
    return this.listingsService.getListings(orgId, filters);
  }
}
