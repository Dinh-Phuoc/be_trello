import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

export const corsOptions = {
    origin: function (origin, callback) {
        if (env.BUILD_MODE === 'dev') {
            return callback(null, true)
        }

        if (WHITELIST_DOMAINS.includes(origin)) {
            return callback(null, true)
        }

        return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
    },

    optionsSuccessStatus: 200,

    credentials: true
}

export const allowCorsForImage = {
    origin: function (origin, callback) {
        if (!origin || origin === 'null' || origin === 'https://sariii-trello.vercel.app') {
            return callback(null, true)
        }

        return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
    },

    optionsSuccessStatus: 200,

    credentials: true
}