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
exports.DebugController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const debug_service_1 = require("./debug.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DebugController = class DebugController {
    constructor(debugService) {
        this.debugService = debugService;
    }
    getMeOrgs(user) {
        return this.debugService.getUserOrgs(user.id);
    }
    getDbHealth() {
        return this.debugService.getDbHealth();
    }
};
exports.DebugController = DebugController;
__decorate([
    (0, common_1.Get)('me-orgs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user organizations', description: 'List all organizations the current user belongs to with their roles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User organizations retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DebugController.prototype, "getMeOrgs", null);
__decorate([
    (0, common_1.Get)('health/db'),
    (0, swagger_1.ApiOperation)({ summary: 'Database health check', description: 'Get database connection status and record counts for all main tables' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Database health information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT token' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DebugController.prototype, "getDbHealth", null);
exports.DebugController = DebugController = __decorate([
    (0, swagger_1.ApiTags)('Debug'),
    (0, common_1.Controller)('debug'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [debug_service_1.DebugService])
], DebugController);
//# sourceMappingURL=debug.controller.js.map