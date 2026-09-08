import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto, RegisterDto, UpdateMeDto } from './dto/auth.dto';
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            email: string | null;
            phone: string | null;
            nickname: string | null;
            id: string;
            locale: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string | null;
            phone: string | null;
            nickname: string | null;
            avatarUrl: string | null;
            locale: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: "ACTIVE";
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refresh(refreshToken: string): Promise<Tokens>;
    logout(userId: string): Promise<{
        loggedOut: true;
    }>;
    me(userId: string): Prisma.Prisma__UserClient<{
        email: string | null;
        phone: string | null;
        nickname: string | null;
        avatarUrl: string | null;
        id: string;
        locale: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    updateMe(userId: string, dto: UpdateMeDto): Prisma.Prisma__UserClient<{
        email: string | null;
        phone: string | null;
        nickname: string | null;
        avatarUrl: string | null;
        id: string;
        locale: string;
        role: import(".prisma/client").$Enums.UserRole;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    private issueTokens;
    private saveRefreshToken;
}
