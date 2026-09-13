import { StatusCodes } from 'http-status-codes'
import { googleService } from '~/services/googleService'
import { buildCookieOptions, serializeCookie } from '~/utils/cookieOptions'

const loginGoogle = async (req, res, next) => {
    try {
        const { credential } = req.body

        const result = await googleService.loginWithGoogle(credential)

        if (!result || !result.token || !result.user) {
            throw new Error('Đăng nhập bằng Google thất bại')
        }

        const { token, user } = result

        const accessTokenCookie = serializeCookie('accessToken', token.accessToken, buildCookieOptions(60 * 60 * 2 * 1000))
        const refreshTokenCookie = serializeCookie('refreshToken', token.refreshToken, buildCookieOptions(60 * 60 * 12 * 1000))
        res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])

        // eslint-disable-next-line no-unused-vars
        const { password, refreshToken, ...userInfo } = user

        return res.status(StatusCodes.OK).json({
            isSuccess: true,
            message: 'Đăng nhập bằng Google thành công',
            user: userInfo
        })
    } catch (error) {
        next(error)
    }
}

export const googleController = {
    loginGoogle
}
