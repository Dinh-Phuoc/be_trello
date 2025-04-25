import { userModel } from '~/models/userModel'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

import ApiError from '~/utils/ApiError'
import { env } from '~/config/environment'
import { base64url } from '~/utils/base64url'

const updateProfile = async (fieldName, id, data) => {
    const updateResult = await userModel.updateProfile(fieldName, id, data)
    return updateResult
}

const getOne = async(fieldName, _id) => {
    const getOne = await userModel.getOne(fieldName, _id)
    return getOne[fieldName]
}

const register = async (reqBody) => {
    const newUser = {
        ...reqBody
    }
    const createdUser = await userModel.register(newUser)
    const message = createdUser ? 'Tạo tài khoản thành công' : 'Tạo tài khoản thất bại'
    return message
}

const login = async (body) => {
    const user = await userModel.getUser(body)
    if (!user) return new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản không tồn tại')

    const isMatch = await bcrypt.compare(body.password, user.password)
    if (!isMatch) return new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản hoặc mật khẩu không chính xác')

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    }

    const payload = {
        userName: user.userName,
        role: user.role,
        iat: Date.now()
    }

    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))

    const tokenData = `${encodedHeader}.${encodedPayload}`

    const hmac = crypto.createHmac('sha256', env.SECRETKEY)
    const signature = hmac.update(tokenData).digest('base64url')
    return `${tokenData}.${signature}`
}

const changePassword = async (fieldName, data) => {
    const payload = {
        id: data.id,
        presentPassword: data.presentPassword,
        newPassword: data.newPassword
    }
    const token = data.token
    if (!token) {
        return { message: 'Bro chưa xác thực' }
    }

    const [headerEncoded, payloadEncoded, tokenSignature] = token.split('.')
    const tokenData = `${headerEncoded}.${payloadEncoded}`

    const hmac = crypto.createHmac('sha256', env.SECRETKEY)
    const signature = hmac.update(tokenData).digest('base64url')

    if (tokenSignature === signature) {
        const info = await userModel.getUser(payload)

        const isMatch = await bcrypt.compare(payload.presentPassword, info.password)
        if (!isMatch) {
            return { change: false, message: 'Mật khẩu hiện tại không chính xác' }
        }

        await userService.updateProfile(fieldName, payload.id, payload.newPassword)

        return { change: true, message: 'Đổi mật khẩu thành công' }
    }
}

const getUser = async(payload) => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...getUser } = await userModel.getUser(payload)
    return getUser
}
export const userService = {
    getUser,
    getOne,
    updateProfile,
    login,
    register,
    changePassword
}