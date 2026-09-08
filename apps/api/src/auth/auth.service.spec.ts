import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('存在しないアカウントのログインを拒否する', async () => {
    const auth = new AuthService(
      { user: { findFirst: jest.fn().mockResolvedValue(null) } } as never,
      {} as never,
      {} as never,
    );
    await expect(auth.login({ identifier: 'nobody@example.jp', password: 'wrong-password' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('停止済みアカウントのリフレッシュを拒否する', async () => {
    const auth = new AuthService(
      { user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', status: 'SUSPENDED', refreshTokenHash: 'hash' }) } } as never,
      { verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', role: 'CUSTOMER' }) } as never,
      { get: jest.fn().mockReturnValue('refresh-secret') } as never,
    );
    await expect(auth.refresh('refresh-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
