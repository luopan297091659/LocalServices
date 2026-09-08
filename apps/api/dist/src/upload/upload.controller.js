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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4']);
let UploadController = class UploadController {
    upload(file) {
        if (!file)
            throw new common_1.BadRequestException('JPEG、PNG、WEBP、MP4ファイルを選択してください');
        if (file.mimetype.startsWith('image/') && file.size > 10 * 1024 * 1024)
            throw new common_1.BadRequestException('画像は10MB以下にしてください');
        const configuredPath = process.env.PUBLIC_PATH?.trim() ?? '';
        const publicPath = !configuredPath || configuredPath === '/' ? '' : `/${configuredPath.replace(/^\/+|\/+$/g, '')}`;
        return { url: `${publicPath}/uploads/${file.filename}`, mimeType: file.mimetype, size: file.size };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({ destination: (_request, _file, callback) => callback(null, process.env.UPLOAD_DIR ?? (0, node_path_1.join)(process.cwd(), 'uploads')), filename: (_request, file, callback) => callback(null, `${(0, node_crypto_1.randomUUID)()}${(0, node_path_1.extname)(file.originalname).toLowerCase()}`) }),
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], UploadController.prototype, "upload", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload')
], UploadController);
//# sourceMappingURL=upload.controller.js.map