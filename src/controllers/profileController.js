import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import crypto from 'crypto'
import { profileService } from '~/services/profileService'

const getInfo = async (req, res, next) => {
    try {
        console.log(req.headers.authorization)
        const token = req.headers.authorization?.slice(7)
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED)
        }

        const [headerEncoded, payloadEncoded, tokenSignature] = token.split('.')
        const tokenData = `${headerEncoded}.${payloadEncoded}`

        const hmac = crypto.createHmac('sha256', env.SECRETKEY)
        const signature = hmac.update(tokenData).digest('base64url')

        if (tokenSignature === signature) {
            const payload = JSON.parse(atob(payloadEncoded))
            const info = await profileService.getInfo(payload)
            res.status(StatusCodes.OK).json(info)
        }
    } catch (error) {
        next(error)
    }
}

export const profileController = {
    getInfo
}