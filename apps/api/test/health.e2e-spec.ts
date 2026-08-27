import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthController } from '../src/health.controller';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Health API', () => {
  it('returns service status', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: { $queryRaw: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    expect(module.get(HealthController).health()).toMatchObject({ status: 'ok', timezone: 'Asia/Tokyo' });
  });
});
