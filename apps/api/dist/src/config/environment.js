"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
const weakSecretFragments = ['replace-with', 'dev-only', 'change-me', 'change_to', 'changeto', 'secret'];
function asBoolean(value, fallback) {
    if (value === undefined || value === '')
        return fallback;
    if (typeof value === 'boolean')
        return value;
    if (value === 'true' || value === '1')
        return true;
    if (value === 'false' || value === '0')
        return false;
    throw new Error('Invalid boolean value');
}
function validateSecret(name, value, production) {
    if (typeof value !== 'string' || value.length === 0) {
        if (production)
            throw new Error(`${name} is required in production`);
        return undefined;
    }
    if (production && (value.length < 32 || weakSecretFragments.some((fragment) => value.toLowerCase().includes(fragment)))) {
        throw new Error(`${name} must be at least 32 characters and must not use a placeholder value`);
    }
    return value;
}
function validateEnvironment(raw) {
    const nodeEnv = raw.NODE_ENV === 'production' || raw.NODE_ENV === 'test' ? raw.NODE_ENV : 'development';
    const production = nodeEnv === 'production';
    const port = Number(raw.PORT ?? 3001);
    if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error('PORT must be an integer between 1 and 65535');
    const databaseUrl = typeof raw.DATABASE_URL === 'string' ? raw.DATABASE_URL : undefined;
    if (production) {
        try {
            const parsedDatabaseUrl = new URL(databaseUrl ?? '');
            if (parsedDatabaseUrl.protocol !== 'mysql:' || !parsedDatabaseUrl.username || !parsedDatabaseUrl.password || /change|replace|example/i.test(databaseUrl ?? '')) {
                throw new Error();
            }
        }
        catch {
            throw new Error('DATABASE_URL must be a complete MySQL/MariaDB URL without placeholder credentials in production');
        }
    }
    const appUrl = typeof raw.APP_URL === 'string' && raw.APP_URL.trim() ? raw.APP_URL : 'http://localhost:3000';
    const origins = appUrl.split(',').map((origin) => origin.trim()).filter(Boolean);
    for (const origin of origins) {
        try {
            const parsedOrigin = new URL(origin);
            if ((production && parsedOrigin.protocol !== 'https:') || origin !== parsedOrigin.origin || parsedOrigin.pathname !== '/' || parsedOrigin.search || parsedOrigin.hash)
                throw new Error();
        }
        catch {
            throw new Error('Every APP_URL value must be an origin only and must use HTTPS in production');
        }
    }
    const trustProxyValue = raw.TRUST_PROXY;
    let trustProxy;
    if (trustProxyValue === 'true')
        trustProxy = true;
    else if (trustProxyValue === 'false' || trustProxyValue === undefined)
        trustProxy = false;
    else if (typeof trustProxyValue === 'string')
        trustProxy = trustProxyValue;
    else
        throw new Error('TRUST_PROXY must be a string or boolean');
    const publicPathValue = typeof raw.PUBLIC_PATH === 'string' ? raw.PUBLIC_PATH.trim() : '';
    const publicPath = !publicPathValue || publicPathValue === '/' ? '' : `/${publicPathValue.replace(/^\/+|\/+$/g, '')}`;
    if (publicPath && (!/^\/[a-z0-9][a-z0-9/_-]*$/.test(publicPath) || publicPath.includes('//'))) {
        throw new Error('PUBLIC_PATH must be a safe URL path such as /local-services');
    }
    const environment = {
        NODE_ENV: nodeEnv,
        HOST: typeof raw.HOST === 'string' ? raw.HOST : '127.0.0.1',
        PORT: port,
        DATABASE_URL: databaseUrl,
        REDIS_URL: typeof raw.REDIS_URL === 'string' ? raw.REDIS_URL : undefined,
        JWT_SECRET: validateSecret('JWT_SECRET', raw.JWT_SECRET, production),
        JWT_REFRESH_SECRET: validateSecret('JWT_REFRESH_SECRET', raw.JWT_REFRESH_SECRET, production),
        APP_URL: origins.join(','),
        PUBLIC_PATH: publicPath,
        UPLOAD_DIR: typeof raw.UPLOAD_DIR === 'string' ? raw.UPLOAD_DIR : production ? '/var/lib/machi-service/uploads' : 'uploads',
        SWAGGER_ENABLED: asBoolean(raw.SWAGGER_ENABLED, !production),
        TRUST_PROXY: trustProxy,
    };
    return { ...raw, ...environment };
}
//# sourceMappingURL=environment.js.map