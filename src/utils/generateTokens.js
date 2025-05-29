import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

const generateTokens = payload => {
    const accessToken = jwt.sign(payload, env.SECRETKEY, { expiresIn: '30m' })

    const refreshToken = jwt.sign(payload, env.REFRESH_SECRETKEY, { expiresIn: '2w' })

    return { accessToken, refreshToken }
}

export default generateTokens