export function normalizePostalCode(value) { return value.replace(/\D/g, '').slice(0, 7); }
export function formatPostalCode(value) { const digits = normalizePostalCode(value); return digits.length === 7 ? `〒${digits.slice(0, 3)}-${digits.slice(3)}` : digits; }
export function normalizeJapanesePhone(value) { return value.replace(/\D/g, ''); }
export function formatJapanesePhone(value) {
    const digits = normalizeJapanesePhone(value);
    if (/^0[789]0\d{8}$/.test(digits))
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    if (/^0(?:3|6)\d{8}$/.test(digits))
        return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    if (/^0120\d{6}$/.test(digits))
        return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    return digits;
}
export function formatJpy(amount) { return `${new Intl.NumberFormat('ja-JP').format(amount)}円`; }
export function formatDistance(meters) { return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`; }
