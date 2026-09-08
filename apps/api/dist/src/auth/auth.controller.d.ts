import type { AuthUser } from '../common/auth.types';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto, UpdateMeDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
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
    refresh(dto: RefreshDto): Promise<import("./auth.service").Tokens>;
    logout(user: AuthUser): Promise<{
        loggedOut: true;
    }>;
    me(user: AuthUser): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string | null;
        phone: string | null;
        nickname: string | null;
        avatarUrl: string | null;
        id: string;
        locale: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateMe(user: AuthUser, dto: UpdateMeDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string | null;
        phone: string | null;
        nickname: string | null;
        avatarUrl: string | null;
        id: string;
        locale: string;
        role: import(".prisma/client").$Enums.UserRole;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
