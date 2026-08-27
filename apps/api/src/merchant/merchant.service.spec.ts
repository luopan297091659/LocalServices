import { ForbiddenException } from '@nestjs/common';
import { MerchantService } from './merchant.service';

describe('MerchantService', () => {
  it('店舗に所属しないユーザーのプロフィール参照を拒否する', async () => {
    const merchant = new MerchantService({ merchantMember: { findFirst: jest.fn().mockResolvedValue(null) } } as never);
    await expect(merchant.profile('outside-user')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
