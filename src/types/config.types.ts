export interface AppConfig {
    nodeEnv: string;
    port: number;
    dbHost: string;
    dbUser: string;
    dbPass: string;
    dbName: string;
    jwtSecret: string;
    jwtAccessExpirationMinutes: number;
    jwtRefreshExpirationDays: number;
    jwtResetPasswordExpirationMinutes: number;
    logFolder: string;
    logFile: string;
    logLevel: string;
    redisHost: string;
    redisPort: number;
    redisUsePassword: string;
    redisPassword?: string;
}
