import { StatusCodes } from 'http-status-codes'
import fs from 'fs-extra'
import path from 'path'
import { env } from 'process'
import crypto from 'crypto'

import { userService } from '~/services/userService'

const login = async (req, res, next) => {
    try {
        const login = await userService.login(req.body)
        res.status(StatusCodes.OK).json(login)
    } catch (error) {
        next(error)
    }
}

const register = async (req, res, next) => {
    try {
        const messageRegister = await userService.register(req.body)
        res.status(StatusCodes.OK).json(messageRegister)
    } catch (error) {
        next(error)
    }
}

const getInfo = async (req, res, next) => {
    try {
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
            const info = await userService.getUser(payload)
            res.status(StatusCodes.OK).json(info)
        }
    } catch (error) {
        next(error)
    }
}

const uploadImageHeader = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('Không có file nào được tải lên')
        }

        const uploadedImageName = await userService.updateProfile('imageHeader', req.params.id, path.basename(req.file.path))
        uploadedImageName && res.status(StatusCodes.OK).json({
            message: 'Cập nhật imageHeader thành công'
        })
    } catch (error) {
        next(error)
    }
}

const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('Không có file nào được tải lên')
        }

        const uploadAvatarName = await userService.updateProfile('avatar', req.params.id, path.basename(req.file.path))
        uploadAvatarName && res.status(StatusCodes.OK).json({
            message: 'Cập nhật avatar thành công'
        })
    } catch (error) {
        next(error)
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const uploadAvatarName = await userService.updateProfile(req.params.fieldName, req.params.id, req.body.data)
        uploadAvatarName && res.status(StatusCodes.OK).json({
            message: `Cập nhật ${req.params.fieldName} thành công`
        })
    } catch (error) {
        next(error)
    }
}

const getImageHeader = async (req, res, next) => {
    try {
        const imageHeaderFileName = await userService.getOne('imageHeader', req.params.id)
        const imageHeaderFileNamePath = path.join(__dirname, `../uploads/image-header/${req.params.id}/`, imageHeaderFileName)

        const imageHeaderFileExists = await fs.pathExists(imageHeaderFileNamePath)
        if (!imageHeaderFileExists) return res.status(StatusCodes.NOT_FOUND).message('Không tìm thấy ảnh')

        res.sendFile(imageHeaderFileNamePath)
    } catch (error) {
        next(error)
    }
}

const getAvatar = async (req, res, next) => {
    try {
        const avatarFileName = await userService.getOne('avatar', req.params.id)
        const avatarFileNamePath = path.join(__dirname, `../uploads/avatar/${req.params.id}/`, avatarFileName)

        const avatarFileExists = await fs.pathExists(avatarFileNamePath)
        if (!avatarFileExists) return res.status(StatusCodes.NOT_FOUND).message('Không tìm thấy ảnh')

        res.sendFile(avatarFileNamePath)
    } catch (error) {
        next(error)
    }
}


export const userController = {
    login,
    register,
    getInfo,
    uploadImageHeader,
    uploadAvatar,
    getImageHeader,
    getAvatar,
    updateProfile
}