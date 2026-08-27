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
});
