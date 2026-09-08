"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const merchants_module_1 = require("./merchants/merchants.module");
const merchant_module_1 = require("./merchant/merchant.module");
const admin_module_1 = require("./admin/admin.module");
const categories_module_1 = require("./categories/categories.module");
const favorites_module_1 = require("./favorites/favorites.module");
const conversations_module_1 = require("./conversations/conversations.module");
const health_controller_1 = require("./health.controller");
const upload_module_1 = require("./upload/upload.module");
const public_content_module_1 = require("./public-content/public-content.module");
const environment_1 = require("./config/environment");
const request_logging_middleware_1 = require("./common/request-logging.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_logging_middleware_1.RequestLoggingMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath: ['../../.env', '.env'], validate: environment_1.validateEnvironment }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            merchants_module_1.MerchantsModule,
            merchant_module_1.MerchantModule,
            admin_module_1.AdminModule,
            categories_module_1.CategoriesModule,
            favorites_module_1.FavoritesModule,
            conversations_module_1.ConversationsModule,
            upload_module_1.UploadModule,
            public_content_module_1.PublicContentModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }, request_logging_middleware_1.RequestLoggingMiddleware],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map