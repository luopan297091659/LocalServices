"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const node_path_1 = require("node:path");
const promises_1 = require("node:fs/promises");
const app_module_1 = require("./app.module");
const api_response_interceptor_1 = require("./common/api-response.interceptor");
const all_exceptions_filter_1 = require("./common/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    const config = app.get(config_1.ConfigService);
    const uploadDirectory = config.get('UPLOAD_DIR') ?? (0, node_path_1.join)(process.cwd(), 'uploads');
    await (0, promises_1.mkdir)(uploadDirectory, { recursive: true });
    app.setGlobalPrefix('api/v1');
    app.set('trust proxy', config.get('TRUST_PROXY') ?? false);
    app.enableShutdownHooks();
    app.use((0, helmet_1.default)());
    app.useStaticAssets(uploadDirectory, { prefix: '/uploads/', fallthrough: false, dotfiles: 'deny' });
    app.enableCors({
        origin: (config.get('APP_URL') ?? 'http://localhost:3000').split(',').map((origin) => origin.trim()),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new api_response_interceptor_1.ApiResponseInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    if (config.get('SWAGGER_ENABLED') ?? true) {
        const swagger = new swagger_1.DocumentBuilder()
            .setTitle('まちサービス API')
            .setDescription('日本ローカルサービスプラットフォーム MVP')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, swagger));
    }
    await app.listen(config.get('PORT') ?? 3001, config.get('HOST') ?? '127.0.0.1');
}
void bootstrap();
//# sourceMappingURL=main.js.map