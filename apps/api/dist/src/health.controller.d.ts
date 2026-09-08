import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    health(): {
        status: string;
        timestamp: string;
        timezone: string;
        uptimeSeconds: number;
    };
    live(): {
        status: string;
        timestamp: string;
        timezone: string;
        uptimeSeconds: number;
    };
    ready(): Promise<{
        status: 'ready';
        database: 'up';
        version: string;
    }>;
}
