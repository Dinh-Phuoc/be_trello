import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import crypto from 'crypto'

const authorizationMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.slice(7)
        if (!token) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Chưa đăng nhập' })
        }

        const [headerEncoded, payloadEncoded, tokenSignature] = token.split('.')

        // const { role } = JSON.parse(atob(payloadEncoded))
        // if ( role !== 'admin') res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Bạn không có quyền chỉnh sửa' })

        const tokenData = `${headerEncoded}.${payloadEncoded}`

        const hmac = crypto.createHmac('sha256', env.SECRETKEY)
        const signature = hmac.update(tokenData).digest('base64url')

        if (tokenSignature !== signature) res.status(StatusCodes.FORBIDDEN).json({ message: 'Sai token' })

        next()
    } catch (error) {
        throw Error(error)
    }
}

export default authorizationMiddleware
