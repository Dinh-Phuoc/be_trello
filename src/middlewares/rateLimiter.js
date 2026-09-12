import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import redisClient from '~/config/redis'

/**
 * @param {object} options
 * @param {number} options.windowMs - Cửa sổ thời gian (ms)
 * @param {number} options.max - Số request tối đa trong window
 * @param {string} options.message - Message trả về khi bị block
 * @param {string} options.prefix - Prefix cho Redis key (tránh conflict giữa các route)
 */
export const createRateLimiter = ({ windowMs, max, message, prefix }) => {
    return rateLimit({
        windowMs, // Time window (ms)
        max, // Max requests per window

        // Redis store - share state giữa instances
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
            prefix: prefix || 'rl:' // ratelimit:login:192.168.1.1
        }),

        // Custom response khi bị rate limit
        handler: (req, res) => {
            const retryAfter = Math.ceil(windowMs / 1000)
            res.status(429).json({
                isSuccess: false,
                statusCode: 429,
                message: message || 'Quá nhiều yêu cầu, vui lòng thử lại sau',
                retryAfter // seconds
            })
        },

        // Set standard headers (RFC 6585)
        standardHeaders: true, // RateLimit-* headers
        legacyHeaders: false, // Disable X-RateLimit-* headers

        // Trust proxy nếu đứng sau nginx/cloudflare
        // Khi trust proxy, dùng X-Forwarded-For
        // Nếu dev local, set false
        skipFailedRequests: false,
        skipSuccessfulRequests: false
    })
}

// ========== Pre-configured limiters ==========

/**
 * Auth rate limiter - chống brute force login/register
 * - 5 attempts per 15 minutes per IP
 * - Window dài vì login fail cần thời gian chờ
 */
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút',
    prefix: 'rl:auth'
})

/**
 * Register rate limiter - chống spam tạo account
 * - 3 accounts per hour per IP
 */
export const registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Quá nhiều yêu cầu đăng ký, vui lòng thử lại sau 1 giờ',
    prefix: 'rl:register'
})

/**
 * Password reset rate limiter
 * - 3 attempts per hour per IP
 */
export const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Quá nhiều yêu cầu đặt lại mật khẩu, vui lòng thử lại sau',
    prefix: 'rl:reset-password'
})

/**
 * General API rate limiter
 * - 100 requests per 15 minutes per IP
 * - Dùng cho tất cả routes /api/v1/*
 */
export const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    prefix: 'rl:api'
})

/**
 * Google OAuth rate limiter - riêng cho Google login
 * - 10 per 15 min
 */
export const googleLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Quá nhiều yêu cầu đăng nhập Google, vui lòng thử lại sau',
    prefix: 'rl:google'
})

const rateLimiters = {
    authLimiter,
    registerLimiter,
    passwordResetLimiter,
    apiLimiter,
    googleLimiter
}

export default rateLimiters