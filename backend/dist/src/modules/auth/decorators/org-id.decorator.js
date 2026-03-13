"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgId = void 0;
const common_1 = require("@nestjs/common");
exports.OrgId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.orgId;
});
//# sourceMappingURL=org-id.decorator.js.map