import { StatusCodes } from 'http-status-codes'
import fs from 'fs-extra'
import path from 'path'
import { userService } from '~/services/userService'

const login = async (req, res, next) => {
    try {
        const token = await userService.login(req.body)
        res.cookie('accessToken', token.accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 2 * 1000
        }).cookie('refreshToken', token.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 12 * 1000
        })
        return res.status(StatusCodes.OK).json({ message: 'Đăng nhập thành công!' })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken

        await userService.logout(token)
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.status(StatusCodes.OK).json({ message: 'Đăng nhập thành công!' })
    } catch (error) {
        next(error)
    }
}

const refresh = async (req, res, next) => {
    try {
        const newToken = await userService.refresh(req.cookies)
        if (newToken.statusCode) {
            res.clearCookie('refreshToken')
            res.clearCookie('accessToken')
            return res.status(newToken.statusCode).json({ statusCode: newToken.message })
        }

        res.cookie('accessToken', newToken.accessToken, {
            httpOnly: true,
            maxAge: 60 * 2 * 1000
        }).cookie('refreshToken', newToken.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 12 * 1000
        })
        return res.status(StatusCodes.OK).json({ message: 'Refresh thành công!' })
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
        const token = req.cookies.accessToken

        const info = await userService.getUser(token)
        res.status(StatusCodes.OK).json(info)
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
        if (req.params.fieldName === 'password') {
            const data = {
                id: req.params.id,
                presentPassword: req.body.presentPassword,
                newPassword: req.body.newPassword,
                token: req.headers.authorization?.slice(7)
            }
            const result = await userService.changePassword('password', data)
            return res.status(StatusCodes.OK).json(result)
        }

        const updateMessage = await userService.updateProfile(req.params.fieldName, req.params.id, req.body.data)
        updateMessage && res.status(StatusCodes.OK).json({
            change: true,
            message: 'Cập nhật thành công'
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

        res.setHeader('Access-Control-Allow-Origin', 'https://rookie.io.vn')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
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
        res.setHeader('Access-Control-Allow-Origin', 'https://rookie.io.vn')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.sendFile(avatarFileNamePath)
    } catch (error) {
        next(error)
    }
}


export const userController = {
    login,
    logout,
    register,
    refresh,
    getInfo,
    uploadImageHeader,
    uploadAvatar,
    getImageHeader,
    getAvatar,
    updateProfile
}