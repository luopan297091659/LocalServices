import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  it('rejects weak production secrets', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production', DATABASE_URL: 'mysql://user:strong-password@localhost/db', APP_URL: 'https://services.machi.jp', JWT_SECRET: 'short', JWT_REFRESH_SECRET: 'also-short' })).toThrow('JWT_SECRET');
  });

  it('accepts a complete production environment', () => {
    const result = validateEnvironment({
      NODE_ENV: 'production', DATABASE_URL: 'mysql://user:strong-password@localhost/db', APP_URL: 'https://services.machi.jp',
      JWT_SECRET: 'a'.repeat(48), JWT_REFRESH_SECRET: 'b'.repeat(48), PORT: '3100', TRUST_PROXY: 'loopback',
    });
    expect(result).toMatchObject({ NODE_ENV: 'production', PORT: 3100, PUBLIC_PATH: '', SWAGGER_ENABLED: false, TRUST_PROXY: 'loopback' });
  });

  it('rejects placeholder database credentials in production', () => {
    expect(() => validateEnvironment({
      NODE_ENV: 'production', DATABASE_URL: 'mysql://user:CHANGE_PASSWORD@localhost/db', APP_URL: 'https://services.machi.jp',
      JWT_SECRET: 'a'.repeat(48), JWT_REFRESH_SECRET: 'b'.repeat(48),
    })).toThrow('DATABASE_URL');
  });

  it('normalizes the public URL path', () => {
    expect(validateEnvironment({ PUBLIC_PATH: 'local-services/' })).toMatchObject({ PUBLIC_PATH: '/local-services' });
  });

  it('rejects invalid proxy configuration values', () => {
    expect(() => validateEnvironment({ TRUST_PROXY: {} })).toThrow('TRUST_PROXY');
  });
});
