import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
import fs from 'fs-extra'
import path from 'path'

const createNew = async (req, res, next) => {
    try {
        const createCard = await cardService.createNew(req.body)
        res.status(StatusCodes.CREATED).json(createCard)
    } catch (error) {
        next(error)
    }
}
const uploadCardCover = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('Không có file nào được tải lên')
        }
        const uploadedImageName = await cardService.update(
            'cover',
            req.params.cardUuid,
            req.cookies.accessToken,
            path.basename(req.file.path)
        )

        if (!uploadedImageName.acknowledged) {
            return res.status(StatusCodes.OK).json({
                isSuccess: false,
                message: 'Fail!'
            })
        }

        res.status(StatusCodes.OK).json({ isSuccess: true, message: 'Successfully!' })

    } catch (error) {
        next(error)
    }
}

const getCardCover = async (req, res, next) => {
    try {
        const cardUuid = req.params.carduuid
        const avatarFileNamePath = await cardService.getOne('cover', cardUuid)

        const avatarFileExists = await fs.pathExists(avatarFileNamePath)
        if (!avatarFileExists) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy ảnh' })

        res.setHeader('Access-Control-Allow-Origin', 'https://rookie.io.vn')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.sendFile(avatarFileNamePath)
    } catch (error) {
        next(error)
    }
}
export const cardController = {
    createNew,
    uploadCardCover,
    getCardCover
}