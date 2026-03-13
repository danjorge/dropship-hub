import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { OrgId } from '../auth/decorators/org-id.decorator';
import { FinanceService } from './finance.service';
import { CreatePixPaymentDto, ConfirmPixPaymentDto } from './dto/finance.dto';

@ApiTags('finance')
@ApiBearerAuth()
@ApiSecurity('x-org-id')
@Controller('finance')
@UseGuards(JwtAuthGuard, OrgGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  async getWallet(@OrgId() orgId: string) {
    return this.financeService.getWallet(orgId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @OrgId() orgId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.getTransactions(
      orgId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('pix')
  @ApiOperation({ summary: 'Create PIX payment request' })
  @ApiResponse({ status: 201, description: 'PIX payment created successfully' })
  async createPixPayment(
    @OrgId() orgId: string,
    @Body() dto: CreatePixPaymentDto,
  ) {
    return this.financeService.createPixPayment(
      orgId,
      dto.amountCents,
      dto.payerName,
      dto.payerDocument,
    );
  }

  @Get('pix')
  @ApiOperation({ summary: 'Get PIX payments history' })
  @ApiResponse({ status: 200, description: 'PIX payments retrieved successfully' })
  async getPixPayments(
    @OrgId() orgId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.getPixPayments(
      orgId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('pix/:id')
  @ApiOperation({ summary: 'Get PIX payment by ID' })
  @ApiResponse({ status: 200, description: 'PIX payment retrieved successfully' })
  async getPixPayment(
    @OrgId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.financeService.getPixPayment(orgId, id);
  }

  @Post('pix/:id/confirm')
  @ApiOperation({ summary: 'Confirm PIX payment (DEMO only)' })
  @ApiResponse({ status: 200, description: 'PIX payment confirmed successfully' })
  async confirmPixPayment(
    @Param('id') id: string,
    @Body() dto: ConfirmPixPaymentDto,
  ) {
    return this.financeService.confirmPixPayment(id);
  }
}
