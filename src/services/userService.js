import { userModel } from '~/models/userModel'
import crypto from 'crypto'
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
    const user = await userModel.login(body)
    if (!user) return new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản hoặc mật khẩu không chính xác')

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

const getUser = async(payload) => {
    const getUser = await userModel.getUser(payload)
    return getUser
}
export const userService = {
    getUser,
    getOne,
    updateProfile,
    login,
    register
}