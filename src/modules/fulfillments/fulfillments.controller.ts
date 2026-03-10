import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { FulfillmentsService } from './fulfillments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { OrgId } from '../auth/decorators/org-id.decorator';
import { ShipFulfillmentDto } from './dto/ship-fulfillment.dto';

@ApiTags('Fulfillments')
@Controller('fulfillments')
@UseGuards(JwtAuthGuard, OrgGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('x-org-id')
export class FulfillmentsController {
  constructor(private readonly fulfillmentsService: FulfillmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get fulfillments', description: 'List all fulfillment orders for the supplier organization' })
  @ApiResponse({ status: 200, description: 'Fulfillments retrieved successfully' })
  getFulfillments(@OrgId() orgId: string) {
    return this.fulfillmentsService.getFulfillments(orgId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm fulfillment', description: 'Confirm a fulfillment order (status: NEW → CONFIRMED)' })
  @ApiParam({ name: 'id', description: 'Fulfillment order ID' })
  @ApiResponse({ status: 200, description: 'Fulfillment confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Fulfillment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - fulfillment does not belong to this org' })
  @ApiResponse({ status: 400, description: 'Bad Request - fulfillment can only be confirmed when status is NEW' })
  confirmFulfillment(@Param('id') id: string, @OrgId() orgId: string) {
    return this.fulfillmentsService.confirmFulfillment(id, orgId);
  }

  @Post(':id/ship')
  @ApiOperation({ summary: 'Ship fulfillment', description: 'Mark fulfillment as shipped with tracking info (status: CONFIRMED → SHIPPED)' })
  @ApiParam({ name: 'id', description: 'Fulfillment order ID' })
  @ApiResponse({ status: 200, description: 'Fulfillment shipped successfully' })
  @ApiResponse({ status: 404, description: 'Fulfillment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - fulfillment does not belong to this org' })
  @ApiResponse({ status: 400, description: 'Bad Request - fulfillment must be confirmed before shipping' })
  shipFulfillment(
    @Param('id') id: string,
    @OrgId() orgId: string,
    @Body() dto: ShipFulfillmentDto,
  ) {
    return this.fulfillmentsService.shipFulfillment(id, orgId, dto);
  }
}
