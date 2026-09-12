import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import jwt from 'jsonwebtoken'

const authorizationMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.accessToken
        if (!token || token === 'undefined') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Chưa đăng nhập' })
        }
        jwt.verify(token, env.SECRETKEY)

        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError')
            res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message })
    }
}

export default authorizationMiddleware
