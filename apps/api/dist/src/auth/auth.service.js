"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const passwordHash = await argon2.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: { email: dto.email, phone: dto.phone, nickname: dto.nickname, passwordHash },
                select: { id: true, email: true, phone: true, nickname: true, role: true, locale: true, createdAt: true },
            });
            const tokens = await this.issueTokens({ sub: user.id, role: user.role, ...(user.email ? { email: user.email } : {}) });
            await this.saveRefreshToken(user.id, tokens.refreshToken);
            return { user, ...tokens };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
                throw new common_1.ConflictException('このメールアドレスまたは電話番号は登録済みです');
            throw error;
        }
    }
    async login(dto) {
        const identifier = dto.identifier.includes('@') ? dto.identifier.trim().toLowerCase() : dto.identifier.replace(/\D/g, '');
        const user = await this.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
        if (!user || user.status !== 'ACTIVE' || !(await argon2.verify(user.passwordHash, dto.password)))
            throw new common_1.UnauthorizedException('ログイン情報が正しくありません');
        const tokens = await this.issueTokens({ sub: user.id, role: user.role, ...(user.email ? { email: user.email } : {}) });
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        const safeUser = {
            id: user.id, email: user.email, phone: user.phone, nickname: user.nickname,
            avatarUrl: user.avatarUrl, locale: user.locale, role: user.role, status: user.status,
            createdAt: user.createdAt, updatedAt: user.updatedAt,
        };
        return { user: safeUser, ...tokens };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, { secret: this.config.get('JWT_REFRESH_SECRET') ?? 'dev-only-refresh-secret-change-me' });
        }
        catch {
            throw new common_1.UnauthorizedException('リフレッシュトークンが無効です');
        }
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || user.status !== 'ACTIVE' || !user.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, refreshToken))) {
            throw new common_1.UnauthorizedException('リフレッシュトークンが無効です');
        }
        const tokens = await this.issueTokens({ sub: user.id, role: user.role, ...(user.email ? { email: user.email } : {}) });
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
        return { loggedOut: true };
    }
    me(userId) {
        return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, phone: true, nickname: true, avatarUrl: true, locale: true, role: true, createdAt: true } });
    }
    updateMe(userId, dto) {
        return this.prisma.user.update({ where: { id: userId }, data: dto, select: { id: true, email: true, phone: true, nickname: true, avatarUrl: true, locale: true, role: true } });
    }
    async issueTokens(payload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, { secret: this.config.get('JWT_SECRET') ?? 'dev-only-secret-change-me-123456789', expiresIn: 900 }),
            this.jwt.signAsync(payload, { secret: this.config.get('JWT_REFRESH_SECRET') ?? 'dev-only-refresh-secret-change-me', expiresIn: 604800 }),
        ]);
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, token) {
        await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: await argon2.hash(token) } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map