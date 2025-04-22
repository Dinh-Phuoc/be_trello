import { StatusCodes } from 'http-status-codes'
import fs from 'fs-extra'
import path from 'path'
import { userService } from '~/services/userService'
const uploadImageHeader = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('Không có file nào được tải lên')
        }

        const uploadedImageName = await userService.uploadImageHeader({ id: req.params.id, imageHeaderFileName: path.basename(req.file.path) })
        uploadedImageName && res.status(StatusCodes.OK).json({
            message: 'Tải lên thành công'
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

        const uploadAvatarName = await userService.uploadAvatar({ id: req.params.id, avatarFileName: path.basename(req.file.path) })
        uploadAvatarName && res.status(StatusCodes.OK).json({
            message: 'Tải lên thành công'
        })
    } catch (error) {
        next(error)
    }
}

const getImageHeader = async (req, res, next) => {
    try {
        const imageHeaderFileName = await userService.getImageHeader(req.params.id)
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
        const avatarFileName = await userService.getAvatar(req.params.id)
        const avatarFileNamePath = path.join(__dirname, `../uploads/avatar/${req.params.id}/`, avatarFileName)

        const avatarFileExists = await fs.pathExists(avatarFileNamePath)
        if (!avatarFileExists) return res.status(StatusCodes.NOT_FOUND).message('Không tìm thấy ảnh')

        res.sendFile(avatarFileNamePath)
    } catch (error) {
        next(error)
    }
}
export const uploadImageController = {
    uploadImageHeader,
    uploadAvatar,
    getImageHeader,
    getAvatar
}