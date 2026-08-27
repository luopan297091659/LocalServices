import { describe, expect, it } from 'vitest';
import { formatDistance, formatJapanesePhone, formatJpy, formatPostalCode, normalizePostalCode } from './index';
describe('日本向け表示ユーティリティ', () => {
  it('郵便番号を正規化・表示する', () => { expect(normalizePostalCode('550-0015')).toBe('5500015'); expect(formatPostalCode('5500015')).toBe('〒550-0015'); });
  it('電話番号を表示する', () => { expect(formatJapanesePhone('09012345678')).toBe('090-1234-5678'); expect(formatJapanesePhone('0612345678')).toBe('06-1234-5678'); });
  it('円と距離を表示する', () => { expect(formatJpy(3500)).toBe('3,500円'); expect(formatDistance(350)).toBe('350m'); expect(formatDistance(1200)).toBe('1.2km'); });
});
