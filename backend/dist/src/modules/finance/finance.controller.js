"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const org_id_decorator_1 = require("../auth/decorators/org-id.decorator");
const finance_service_1 = require("./finance.service");
const finance_dto_1 = require("./dto/finance.dto");
let FinanceController = class FinanceController {
    constructor(financeService) {
        this.financeService = financeService;
    }
    async getWallet(orgId) {
        return this.financeService.getWallet(orgId);
    }
    async getTransactions(orgId, page, limit) {
        return this.financeService.getTransactions(orgId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async createPixPayment(orgId, dto) {
        return this.financeService.createPixPayment(orgId, dto.amountCents, dto.payerName, dto.payerDocument);
    }
    async getPixPayments(orgId, page, limit) {
        return this.financeService.getPixPayments(orgId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async getPixPayment(orgId, id) {
        return this.financeService.getPixPayment(orgId, id);
    }
    async confirmPixPayment(id, dto) {
        return this.financeService.confirmPixPayment(id);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('wallet'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('pix'),
    (0, swagger_1.ApiOperation)({ summary: 'Create PIX payment request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'PIX payment created successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, finance_dto_1.CreatePixPaymentDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createPixPayment", null);
__decorate([
    (0, common_1.Get)('pix'),
    (0, swagger_1.ApiOperation)({ summary: 'Get PIX payments history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PIX payments retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getPixPayments", null);
__decorate([
    (0, common_1.Get)('pix/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get PIX payment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PIX payment retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getPixPayment", null);
__decorate([
    (0, common_1.Post)('pix/:id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm PIX payment (DEMO only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PIX payment confirmed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, finance_dto_1.ConfirmPixPaymentDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "confirmPixPayment", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('finance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map