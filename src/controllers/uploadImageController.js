import { StatusCodes } from 'http-status-codes'
import path from 'path'
const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('Không có file nào được tải lên')
        }

        const uploadedImagesPaths = req.file.path
        res.status(StatusCodes.CREATED).json({
            message: 'Tải lên thành công',
            file: uploadedImagesPaths
        })
    } catch (error) {
        next(error)
    }
}
export const uploadImageController = {
    uploadFile
}