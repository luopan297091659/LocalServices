import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import type { AuthUser } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: AuthUser): Promise<AuthUser>;
}
export {};
