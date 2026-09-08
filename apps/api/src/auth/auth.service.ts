import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/auth.types';
import type { LoginDto, RegisterDto, UpdateMeDto } from './dto/auth.dto';

export interface Tokens { accessToken: string; refreshToken: string }

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, phone: dto.phone, nickname: dto.nickname, passwordHash },
        select: { id: true, email: true, phone: true, nickname: true, role: true, locale: true, createdAt: true },
      });
      const tokens = await this.issueTokens({ sub: user.id, role: user.role, ...(user.email ? { email: user.email } : {}) });
      await this.saveRefreshToken(user.id, tokens.refreshToken);
      return { user, ...tokens };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('このメールアドレスまたは電話番号は登録済みです');
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.includes('@') ? dto.identifier.trim().toLowerCase() : dto.identifier.replace(/\D/g, '');
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
    if (!user || user.status !== 'ACTIVE' || !(await argon2.verify(user.passwordHash, dto.password))) throw new UnauthorizedException('ログイン情報が正しくありません');
    const tokens = await this.issueTokens({ sub: user.id, role: user.role, ...(user.email ? { email: user.email } : {}) });
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    const safeUser = {
      id: user.id, email: user.email, phone: user.phone, nickname: user.nickname,
      avatarUrl: user.avatarUrl, locale: user.locale, role: user.role, status: user.status,
      createdAt: user.createdAt, updatedAt: user.updatedAt,
    };
    return { user: safeUser, ...tokens };
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    let payload: AuthUser;
    try {
      payload = await this.jwt.verifyAsync<AuthUser>(refreshToken, { secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-only-refresh-secret-change-me' });
    } catch { throw new UnauthorizedException('リフレッシュトークンが無効です'); }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE' || !user.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, refreshToken))) {
      throw new UnauthorizedException('リフレッシュトークンが無効です');
    }
    const tokens = await this.issueTokens({ sub: user.id, role: user.role, ...(user.email ? { email: user.email } : {}) });
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<{ loggedOut: true }> {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { loggedOut: true };
  }

  me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, phone: true, nickname: true, avatarUrl: true, locale: true, role: true, createdAt: true } });
  }

  updateMe(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto, select: { id: true, email: true, phone: true, nickname: true, avatarUrl: true, locale: true, role: true } });
  }

  private async issueTokens(payload: AuthUser): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_SECRET') ?? 'dev-only-secret-change-me-123456789', expiresIn: 900 }),
      this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-only-refresh-secret-change-me', expiresIn: 604800 }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: await argon2.hash(token) } });
  }
}
