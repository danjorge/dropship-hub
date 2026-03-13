"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgRole = void 0;
const common_1 = require("@nestjs/common");
exports.OrgRole = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.orgRole;
});
//# sourceMappingURL=org-role.decorator.js.map