import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

const generateTokens = payload => {
    const accessToken = jwt.sign(payload, env.SECRETKEY, { expiresIn: '1m' })

    const refreshToken = jwt.sign(payload, env.REFRESH_SECRETKEY, { expiresIn: '2m' })

    return { accessToken, refreshToken }
}

export default generateTokens