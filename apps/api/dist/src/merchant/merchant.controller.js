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
exports.MerchantController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/current-user.decorator");
const roles_decorator_1 = require("../common/roles.decorator");
const merchant_dto_1 = require("./dto/merchant.dto");
const merchant_service_1 = require("./merchant.service");
let MerchantController = class MerchantController {
    merchant;
    constructor(merchant) {
        this.merchant = merchant;
    }
    create(user, dto) { return this.merchant.create(user.sub, dto); }
    profile(user) { return this.merchant.profile(user.sub); }
    update(user, dto) { return this.merchant.update(user.sub, dto); }
    submit(user, dto) { return this.merchant.submit(user.sub, dto); }
    dashboard(user) { return this.merchant.dashboard(user.sub); }
    hours(user, dto) { return this.merchant.setHours(user.sub, dto); }
    services(user) { return this.merchant.listServices(user.sub); }
    createService(user, dto) { return this.merchant.createService(user.sub, dto); }
    updateService(user, id, dto) { return this.merchant.updateService(user.sub, id, dto); }
    deleteService(user, id) { return this.merchant.deleteService(user.sub, id); }
    products(user) { return this.merchant.listProducts(user.sub); }
    createProduct(user, dto) { return this.merchant.createProduct(user.sub, dto); }
    updateProduct(user, id, dto) { return this.merchant.updateProduct(user.sub, id, dto); }
    deleteProduct(user, id) { return this.merchant.deleteProduct(user.sub, id); }
    media(user) { return this.merchant.listMedia(user.sub); }
    conversations(user) { return this.merchant.conversations(user.sub); }
    addMedia(user, dto) { return this.merchant.addMedia(user.sub, dto); }
    deleteMedia(user, id) { return this.merchant.deleteMedia(user.sub, id); }
};
exports.MerchantController = MerchantController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.UpdateMerchantDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "profile", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN),
    (0, common_1.Put)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.UpdateMerchantDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN),
    (0, common_1.Post)('submit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.VerificationDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "submit", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "dashboard", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN),
    (0, common_1.Put)('business-hours'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.SetBusinessHoursDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "hours", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Get)('services'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "services", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Post)('services'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.ServiceDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "createService", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Put)('services/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, merchant_dto_1.ServiceDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "updateService", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN),
    (0, common_1.Delete)('services/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "deleteService", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Get)('products'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "products", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Post)('products'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.ProductDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "createProduct", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Put)('products/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, merchant_dto_1.ProductDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "updateProduct", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN),
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "deleteProduct", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Get)('media'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "media", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Get)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "conversations", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN, client_1.UserRole.MERCHANT_STAFF),
    (0, common_1.Post)('media'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, merchant_dto_1.MediaDto]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "addMedia", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT_ADMIN),
    (0, common_1.Delete)('media/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "deleteMedia", null);
exports.MerchantController = MerchantController = __decorate([
    (0, common_1.Controller)('merchant'),
    __metadata("design:paramtypes", [merchant_service_1.MerchantService])
], MerchantController);
//# sourceMappingURL=merchant.controller.js.map