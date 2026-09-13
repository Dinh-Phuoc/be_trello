import { OAuth2Client } from 'google-auth-library'
import { env } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { v4 } from 'uuid'
import generateTokens from '~/utils/generateTokens'
import { USER_ROLE } from '~/utils/constants'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

/**
 * Verify Google ID Token từ client gửi lên
 * @param {string} credential - Google ID Token (JWT)
 * @returns {Promise<object>} - Payload từ Google (email, name, picture, sub)
 */
const verifyGoogleToken = async (credential) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: env.GOOGLE_CLIENT_ID
        })
        return ticket.getPayload()
    } catch (error) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google token không hợp lệ')
    }
}

/**
 * Tìm user theo googleId, nếu chưa có thì tạo mới
 * @param {object} googlePayload - Payload từ Google
 * @returns {Promise<object>} - User document trong DB
 */
const findOrCreateUser = async (googlePayload) => {
    const { sub: googleId, email, name, picture } = googlePayload

    // Tìm user theo googleId trước
    let user = await userModel.getUser('googleId', googleId)

    if (user) return user

    // Nếu chưa có, thử tìm theo email (user đã đăng ký bằng email/password)
    user = await userModel.getUser('email', email)

    if (user) {
        // Liên kết Google account với user hiện tại
        await userModel.updateProfile('googleId', user.uuid, googleId)
        if (picture && !user.avatar) {
            await userModel.updateProfile('avatar', user.uuid, picture)
        }
        return { ...user, googleId, avatar: user.avatar || picture }
    }

    // Tạo user mới
    const newUser = {
        uuid: v4(),
        userName: email.split('@')[0],
        email,
        fullName: name || email.split('@')[0],
        avatar: picture || '',
        googleId,
        password: v4(), // Google user không có password
        role: USER_ROLE.GUEST
    }

    await userModel.register(newUser)
    return await userModel.getUser('googleId', googleId)
}

/**
 * Xử lý đăng nhập/đăng ký bằng Google
 * @param {string} credential - Google ID Token
 * @returns {Promise<object>} - { accessToken, refreshToken, user }
 * @throws {ApiError} Nếu có bất kỳ lỗi nào trong quá trình xử lý
 */
const loginWithGoogle = async (credential) => {
    const googlePayload = await verifyGoogleToken(credential)

    if (!googlePayload?.email_verified) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email Google chưa được xác thực')
    }

    const user = await findOrCreateUser(googlePayload)

    if (!user || user._destroy) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Tài khoản đã bị vô hiệu hóa')
    }

    const payload = {
        uuid: user.uuid,
        jit: v4(),
        role: user.role
    }

    const token = generateTokens(payload)
    await userModel.updateProfile('refreshToken', user.uuid, token.refreshToken)

    return { token, user }
}

export const googleService = {
    verifyGoogleToken,
    findOrCreateUser,
    loginWithGoogle
}
