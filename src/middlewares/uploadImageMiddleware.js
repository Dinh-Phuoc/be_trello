import path from 'path'
import multer from 'multer'
import fs from 'fs-extra'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

const imageHeaderStorage = multer.diskStorage({
    destination: async (req, file, callback) => {
        const { uuid } = jwt.verify(req.cookies.accessToken, env.SECRETKEY)
        const destinationPath = path.join(__dirname, `../uploads/image-header/${uuid}/`)

        await fs.ensureDir(destinationPath)

        const files = await fs.readdir(destinationPath)
        for (const fileName of files) {
            const filePath = path.join(destinationPath, fileName)
            await fs.remove(filePath)
        }
        callback(null, destinationPath)
    },
    filename: (req, file, callback) => {
        const newFileName = `${Date.now()}-${file.originalname}`
        callback(null, newFileName)
    }
})

const avatarStorage = multer.diskStorage({
    destination: async (req, file, callback) => {
        const { uuid } = jwt.verify(req.cookies.accessToken, env.SECRETKEY)
        const destinationPath = path.join(__dirname, `../uploads/avatar/${uuid}/`)

        await fs.ensureDir(destinationPath)

        const files = await fs.readdir(destinationPath)
        for (const fileName of files) {
            const filePath = path.join(destinationPath, fileName)
            await fs.remove(filePath)
        }
        callback(null, destinationPath)
    },
    filename: (req, file, callback) => {
        const newFileName = `${Date.now()}-${file.originalname}`
        callback(null, newFileName)
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true)
    } else {
        callback(new Error('Chỉ có thể tải file ảnh'), false)
    }
}

const imageHeaderCardStorage = multer.diskStorage({
    destination: async (req, file, callback) => {
        const { uuid } = jwt.verify(req.cookies.accessToken, env.SECRETKEY)
        const destinationPath = path.join(__dirname, `../uploads/imageHeaderCard/${uuid}/`)

        await fs.ensureDir(destinationPath)

        const files = await fs.readdir(destinationPath)
        for (const fileName of files) {
            const filePath = path.join(destinationPath, fileName)
            await fs.remove(filePath)
        }
        callback(null, destinationPath)
    },
    filename: (req, file, callback) => {
        const newFileName = `${Date.now()}-${file.originalname}`
        callback(null, newFileName)
    }
})

const uploadImageHeader = multer({
    storage: imageHeaderStorage,
    fileFilter,
    limits: {
        fileSize: 1024*1024*5
    }
})

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter,
    limits: {
        fileSize: 1024*1024*5
    }
})

const uploadImageHeaderCard = multer({
    storage: imageHeaderCardStorage,
    fileFilter,
    limits: {
        fileSize: 1024*1024*5
    }
})

export const uploadImageMiddleware = {
    uploadImageHeader,
    uploadAvatar,
    uploadImageHeaderCard
}