import Redis from 'ioredis'
import { env } from './environment'

/**
 * Singleton Redis client cho rate limiting & caching.
 *
 * Lý do dùng singleton:
 * - 1 process chỉ cần 1 connection pool
 * - Tránh tạo connection mới mỗi lần import
 * - Dễ share giữa rate-limit-redis và các module khác
 *
 * ⚠️ Lưu ý quan trọng về enableOfflineQueue:
 * - Trước đó set = false → gây lỗi "Stream isn't writeable" khi Redis chưa ready
 *   vì RedisStore.init() của rate-limit-redis gọi sendCommand NGAY khi khởi tạo
 *   nhưng TCP connection là bất đồng bộ (chưa kịp kết nối).
 * - Set = true (mặc định) → commands được queue và thực thi khi connection ready.
 *
 * Config:
 * - retryStrategy: tự động reconnect với exponential backoff
 * - maxRetriesPerRequest: null = retry mãi → không bao giờ fail
 * - enableReadyCheck: true → kiểm tra server ready trước khi gửi INFO
 */
const redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,

    // Retry với exponential backoff: 50ms, 100ms, 200ms... max 3s
    retryStrategy(times) {
        const delay = Math.min(times * 50, 3000)
        console.log(`⚠️ Redis reconnect attempt #${times}, retry in ${delay}ms`)
        return delay
    },

    // null = retry indefinitely. Khi Redis tạm thời down, request sẽ đợi reconnect
    // thay vì fail ngay (better UX cho rate limiting)
    maxRetriesPerRequest: null,

    // ✅ QUAN TRỌNG: cho phép queue commands khi Redis đang reconnect
    // Tránh lỗi "Stream isn't writeable" khi client vừa khởi tạo
    enableOfflineQueue: true,

    // Kiểm tra server ready bằng INFO command trước khi báo "ready"
    enableReadyCheck: true,

    // Connection timeout - tăng lên 10s cho Redis Cloud
    connectTimeout: 10000,

    // Không lazy - connect ngay khi tạo để dễ debug
    lazyConnect: false
})

// ========== Event listeners ==========
redisClient.on('connect', () => {
    console.log('✅ Redis connected (TCP)')
})

redisClient.on('ready', () => {
    console.log('✅ Redis ready to accept commands')
})

redisClient.on('error', (err) => {
    // Log nhưng KHÔNG crash server
    // Redis tạm thời down → reconnect tự động
    console.error('❌ Redis error:', err.message)
})

redisClient.on('close', () => {
    console.log('⚠️ Redis connection closed')
})

redisClient.on('reconnecting', (ms) => {
    console.log(`🔄 Redis reconnecting in ${ms}ms`)
})

redisClient.on('end', () => {
    console.log('🔚 Redis connection ended (no more reconnects)')
})

// ========== Helpers ==========

/**
 * Đợi Redis ready trước khi start server.
 *
 * Tại sao cần:
 * - rate-limit-redis RedisStore.init() cần gửi EVALSHA ngay khi khởi tạo
 * - Nếu Redis chưa ready → throw error
 * - Giải pháp: đợi 'ready' event trước khi start Express server
 *
 * @returns {Promise<void>}
 */
export const waitForRedisReady = () => {
    return new Promise((resolve, reject) => {
        // Nếu đã ready rồi (cached state)
        if (redisClient.status === 'ready') {
            resolve()
            return
        }

        const timeout = setTimeout(() => {
            reject(new Error('Redis connection timeout (10s)'))
        }, 10000)

        redisClient.once('ready', () => {
            clearTimeout(timeout)
            resolve()
        })

        redisClient.once('end', () => {
            clearTimeout(timeout)
            reject(new Error('Redis connection ended before ready'))
        })
    })
}

/**
 * Ping Redis để check connection.
 * Dùng cho /health endpoint hoặc startup check.
 *
 * @returns {Promise<boolean>}
 */
export const pingRedis = async () => {
    try {
        const result = await redisClient.ping()
        return result === 'PONG'
    } catch (err) {
        console.error('Redis ping failed:', err.message)
        return false
    }
}

// ========== Graceful shutdown ==========

/**
 * Đóng connection khi process shutdown.
 * Đảm bảo không để dangling connections.
 */
export const closeRedis = async () => {
    try {
        await redisClient.quit()
        console.log('👋 Redis closed gracefully')
    } catch (err) {
        console.error('Error closing Redis:', err.message)
        redisClient.disconnect() // Force close
    }
}

// Handle process signals (cùng với exitHook trong authServer.js)
process.on('SIGINT', async () => {
    await closeRedis()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await closeRedis()
    process.exit(0)
})

export default redisClient
