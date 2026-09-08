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
exports.BannerDto = exports.CategoryDto = exports.UserStatusDto = exports.MerchantStatusDto = exports.RejectMerchantDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_validator_2 = require("class-validator");
class RejectMerchantDto {
    reason;
}
exports.RejectMerchantDto = RejectMerchantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RejectMerchantDto.prototype, "reason", void 0);
class MerchantStatusDto {
    status;
}
exports.MerchantStatusDto = MerchantStatusDto;
__decorate([
    (0, class_validator_2.IsEnum)(client_1.MerchantStatus),
    __metadata("design:type", String)
], MerchantStatusDto.prototype, "status", void 0);
class UserStatusDto {
    status;
}
exports.UserStatusDto = UserStatusDto;
__decorate([
    (0, class_validator_2.IsEnum)(client_1.UserStatus),
    __metadata("design:type", String)
], UserStatusDto.prototype, "status", void 0);
class CategoryDto {
    nameJa;
    parentId;
    icon;
    enabled;
}
exports.CategoryDto = CategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "nameJa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CategoryDto.prototype, "enabled", void 0);
class BannerDto {
    title;
    imageUrl;
    linkUrl;
    enabled;
}
exports.BannerDto = BannerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], BannerDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], BannerDto.prototype, "linkUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BannerDto.prototype, "enabled", void 0);
//# sourceMappingURL=admin.dto.js.map