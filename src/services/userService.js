import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { v4 } from 'uuid'
import path from 'path'

import ApiError from '~/utils/ApiError'
import { env } from '~/config/environment'
import generateTokens from '~/utils/generateTokens'

const updateProfile = async (fieldName, token, data) => {
    try {
        const { uuid } = jwt.verify(token, env.SECRETKEY)
        const updateResult = await userModel.updateProfile(fieldName, uuid, data)
        return updateResult
    } catch (error) {
        return error
    }
}

const getOne = async(fieldName, token) => {
    try {
        const { uuid } = jwt.verify(token, env.SECRETKEY)

        if (fieldName === 'imageHeader') {
            const result = await userModel.getOne(fieldName, uuid)
            const filePath = path.join(__dirname, `../uploads/image-header/${uuid}/`, result[fieldName])
            return filePath
        }
        if (fieldName === 'avatar') {
            const result = await userModel.getOne(fieldName, uuid)
            const filePath = path.join(__dirname, `../uploads/avatar/${uuid}/`, result[fieldName])
            return filePath
        }

        const getOne = await userModel.getOne(fieldName, uuid)
        return getOne[fieldName]
    } catch (error) {
        return error
    }
}

const register = async (reqBody) => {
    const newUser = {
        ...reqBody
    }
    const user = await userModel.getUser('userName', newUser.userName)
    if (user) return new ApiError(StatusCodes.CONFLICT, 'Tài khoản đã tồn tại')

    const createdUser = await userModel.register(newUser)
    const message = createdUser && 'Tạo tài khoản thành công'
    return message
}

const login = async (body) => {
    const user = await userModel.getUser('userName', body.userName)
    if (!user) return new ApiError(StatusCodes.UNAUTHORIZED, 'Tài khoản không tồn tại')

    const isMatch = await bcrypt.compare(body.password, user.password)
    if (!isMatch) return new ApiError(StatusCodes.FORBIDDEN, 'Tài khoản hoặc mật khẩu không chính xác')

    const payload = {
        uuid: user.uuid,
        jit: v4(),
        role: user.role
    }

    const token = generateTokens(payload)
    await userModel.updateProfile('refreshToken', payload.uuid, token.refreshToken)
    return token
}

const refresh = async (cookies) => {
    const refreshToken = cookies.refreshToken
    if (!refreshToken) return new ApiError(StatusCodes.UNAUTHORIZED, 'Chưa đăng nhập')

    const user = await userModel.getUser('refreshToken', cookies.refreshToken)
    if (!user) return new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền')

    try {
        jwt.verify(refreshToken, env.REFRESH_SECRETKEY)

        const payload = {
            uuid: user.uuid,
            jit: v4(),
            role: user.role
        }
        const newToken = generateTokens(payload)
        await userModel.updateProfile('refreshToken', payload.uuid, newToken.refreshToken)

        return newToken
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            await userModel.updateProfile('refreshToken', user.uuid, null)
        }
        return new ApiError(StatusCodes.UNAUTHORIZED, error)
    }
}

const logout = async (token) => {
    if (!token) return new ApiError(StatusCodes.UNAUTHORIZED)

    try {
        const decoded = jwt.verify(token, env.SECRETKEY)
        const { uuid } = decoded
        await userModel.updateProfile('refreshToken', uuid, null)
        return new ApiError(StatusCodes.OK)
    } catch (error) {
        return new ApiError(StatusCodes.UNAUTHORIZED, error)
    }
}

const changePassword = async (fieldName, data) => {
    const payload = {
        presentPassword: data.presentPassword,
        newPassword: data.newPassword
    }
    const token = data.token
    if (!token) {
        return { message: 'Bro chưa xác thực' }
    }

    try {
        const decoded = jwt.verify(token, env.SECRETKEY)

        if (!decoded) {
            return new ApiError(StatusCodes.UNAUTHORIZED, { message: 'Chưa đăng nhập' })
        }

        const info = await userModel.getUser('uuid', decoded.uuid)

        const isMatch = await bcrypt.compare(payload.presentPassword, info.password)
        if (!isMatch) {
            return { change: false, message: 'Mật khẩu hiện tại không chính xác' }
        }

        await userModel.updateProfile(fieldName, decoded.uuid, payload.newPassword)

        return { change: true, message: 'Đổi mật khẩu thành công' }
    } catch (error) {
        return error
    }
}

const getUser = async(token) => {
    try {
        const decoded = jwt.verify(token, env.SECRETKEY)
        // eslint-disable-next-line no-unused-vars
        const { password, ...info } = await userModel.getUser('uuid', decoded.uuid)
        return info
    } catch (error) {
        return new ApiError(StatusCodes.FORBIDDEN, error)
    }
}
export const userService = {
    getUser,
    getOne,
    updateProfile,
    login,
    logout,
    register,
    refresh,
    changePassword
}