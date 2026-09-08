export interface AppEnvironment {
    NODE_ENV: 'development' | 'test' | 'production';
    HOST: string;
    PORT: number;
    DATABASE_URL: string | undefined;
    REDIS_URL: string | undefined;
    JWT_SECRET: string | undefined;
    JWT_REFRESH_SECRET: string | undefined;
    APP_URL: string;
    PUBLIC_PATH: string;
    UPLOAD_DIR: string;
    SWAGGER_ENABLED: boolean;
    TRUST_PROXY: string | boolean;
}
export declare function validateEnvironment(raw: Record<string, unknown>): Record<string, unknown>;
