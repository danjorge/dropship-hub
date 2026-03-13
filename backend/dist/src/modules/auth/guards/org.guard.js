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
var OrgGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/db/prisma.service");
let OrgGuard = OrgGuard_1 = class OrgGuard {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OrgGuard_1.name);
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
        if (!user?.id) {
            this.logger.warn('OrgGuard: No user found in request');
            return false;
        }
        const orgId = req.headers["x-org-id"]?.trim();
        if (!orgId) {
            this.logger.warn(`OrgGuard: Missing x-org-id header for user ${user.id}`);
            throw new common_1.BadRequestException("Missing x-org-id header");
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(orgId)) {
            this.logger.warn(`OrgGuard: Invalid orgId format: ${orgId} for user ${user.id}`);
            throw new common_1.BadRequestException("Invalid organization ID format");
        }
        const membership = await this.prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId: user.id } },
            select: {
                role: true,
                org: {
                    select: {
                        id: true,
                        type: true,
                        name: true,
                    }
                }
            },
        });
        if (!membership) {
            this.logger.warn(`OrgGuard: Forbidden access attempt - User ${user.id} (${user.email}) tried to access org ${orgId}`);
            throw new common_1.ForbiddenException("User is not a member of this organization");
        }
        req.orgId = orgId;
        req.orgRole = membership.role;
        req.orgType = membership.org.type;
        req.userId = user.id;
        return true;
    }
};
exports.OrgGuard = OrgGuard;
exports.OrgGuard = OrgGuard = OrgGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrgGuard);
//# sourceMappingURL=org.guard.js.map