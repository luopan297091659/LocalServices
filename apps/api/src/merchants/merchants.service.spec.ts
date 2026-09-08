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

  it('半径検索ではデータベース側の経緯度範囲で候補を絞り込む', async () => {
    let receivedQuery: unknown;
    const findMany = jest.fn((query: unknown): Promise<never[]> => { receivedQuery = query; return Promise.resolve([]); });
    const service = new MerchantsService({ merchant: { findMany } } as never);
    await service.search({ sort: 'distance', page: 1, pageSize: 20, lat: 35, lng: 135, radius: 10_000 });
    const bounds = (receivedQuery as { where?: { address?: { is?: { latitude?: { gte?: unknown; lte?: unknown }; longitude?: { gte?: unknown; lte?: unknown } } } } }).where?.address?.is;
    expect(typeof bounds?.latitude?.gte).toBe('number');
    expect(typeof bounds?.latitude?.lte).toBe('number');
    expect(typeof bounds?.longitude?.gte).toBe('number');
    expect(typeof bounds?.longitude?.lte).toBe('number');
  });
});
