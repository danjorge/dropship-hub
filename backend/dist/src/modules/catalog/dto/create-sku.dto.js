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
exports.CreateSkuDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateSkuDto {
}
exports.CreateSkuDto = CreateSkuDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SKU code (unique within product)',
        example: 'HEADPHONE-BLACK-001',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkuDto.prototype, "skuCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Variant attributes (color, size, etc.)',
        example: { color: 'Black', size: 'Standard' },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSkuDto.prototype, "variantJson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weight in grams',
        example: 250,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSkuDto.prototype, "weightGrams", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Length in centimeters',
        example: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSkuDto.prototype, "lengthCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Width in centimeters',
        example: 18,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSkuDto.prototype, "widthCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Height in centimeters',
        example: 8,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSkuDto.prototype, "heightCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'GTIN/EAN/UPC barcode',
        example: '7891234567890',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSkuDto.prototype, "gtin", void 0);
//# sourceMappingURL=create-sku.dto.js.map