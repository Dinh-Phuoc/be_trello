import 'dotenv/config'

export const env = {
    AUTHOR_PORT: process.env.AUTHOR_PORT,
    APP_HOST: process.env.APP_HOST,
    APP_PORT: process.env.APP_PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    DATABASE_NAME: process.env.DATABASE_NAME,
    BUILD_MODE: process.env.BUILD_MODE,
    SECRETKEY: process.env.SECRETKEY,
    REFRESH_SECRETKEY: process.env.REFRESH_SECRETKEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    // ===== Redis =====
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
    REDIS_DB: process.env.REDIS_DB || '0'
}