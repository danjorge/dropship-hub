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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOfferDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateOfferDto {
}
exports.CreateOfferDto = CreateOfferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SKU ID for this offer',
        example: '660e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "skuId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cost price in cents',
        example: 5000,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "costCents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Manufacturer suggested retail price in cents',
        example: 12000,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "msrpCents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Available stock quantity',
        example: 100,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "stockQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Service level agreement in days',
        example: 3,
        default: 2,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "slaDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Shipping origin location',
        example: 'São Paulo, SP',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "shipsFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Allow random color selection',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOfferDto.prototype, "allowRandomColor", void 0);
//# sourceMappingURL=create-offer.dto.js.map