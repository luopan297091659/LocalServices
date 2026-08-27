import { MerchantsService } from './merchants.service';

describe('MerchantsService', () => {
  it('公開中の店舗だけを検索条件に含める', async () => {
    let receivedQuery: unknown;
    const findMany = jest.fn((query: unknown): Promise<never[]> => { receivedQuery = query; return Promise.resolve([]); });
    const count = jest.fn((): Promise<number> => Promise.resolve(0));
    const service = new MerchantsService({ merchant: { findMany, count } } as never);
    const result = await service.search({ sort: 'recommended', page: 1, pageSize: 20 });
    expect(receivedQuery).toMatchObject({ where: { status: 'ACTIVE' } });
    expect(result.pagination).toEqual({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  });
});
