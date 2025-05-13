import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
import path from 'path'

const createNew = async (req, res, next) => {
    try {
        const createCard = await cardService.createNew(req.body)
        res.status(StatusCodes.CREATED).json(createCard)
    } catch (error) {
        next(error)
    }
}
const uploadImageHeaderCard = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('Không có file nào được tải lên')
        }

        const uploadedImageName = await cardService.update(
            'imageHeaderCard',
            req.params.carduuid,
            req.params.useruuid,
            path.basename(req.file.path)
        )

        uploadedImageName && res.status(StatusCodes.OK).json({
            message: 'Cập nhật Image Header Card thành công'
        })
    } catch (error) {
        next(error)
    }
}

export const cardController = {
    createNew,
    uploadImageHeaderCard
}