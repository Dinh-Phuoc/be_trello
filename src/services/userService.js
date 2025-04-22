import { userModel } from '~/models/userModel'


const uploadImageHeader = async(data) => {
    const upload = await userModel.update('imageHeader', data)
    return upload
}

const uploadAvatar = async(data) => {
    const upload = await userModel.update('avatar', data)
    return upload
}

const getImageHeader = async(_id) => {
    const getImageHeader = await userModel.getImage('imageHeader', _id)
    return getImageHeader.imageHeader
}

const getAvatar = async(_id) => {
    const getAvatar = await userModel.getImage('avatar', _id)
    return getAvatar.avatar
}

export const userService = {
    uploadImageHeader,
    uploadAvatar,
    getImageHeader,
    getAvatar
}