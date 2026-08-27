import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from './common/public.decorator';
import { PrismaService } from './prisma/prisma.service';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  @Get()
  health(): { status: string; timestamp: string; timezone: string; uptimeSeconds: number } {
    return { status: 'ok', timestamp: new Date().toISOString(), timezone: 'Asia/Tokyo', uptimeSeconds: Math.floor(process.uptime()) };
  }

  @Get('live')
  live() { return this.health(); }

  @Get('ready')
  async ready(): Promise<{ status: 'ready'; database: 'up'; version: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'up', version: this.config.get<string>('npm_package_version') ?? '0.1.0' };
    } catch {
      throw new ServiceUnavailableException('データベースに接続できません');
    }
  }
}
