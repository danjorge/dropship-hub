export declare class EnvironmentVariables {
    DATABASE_URL: string;
    JWT_SECRET: string;
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    APP_ENC_KEY?: string;
    PORT?: string;
    CORS_ORIGIN?: string;
    NODE_ENV?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
