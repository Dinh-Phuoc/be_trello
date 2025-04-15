import { userModel } from '~/models/userModel'

const getInfo = async (payload) => {
    const info = await userModel.login(payload)

    return info
}

export const profileService = {
    getInfo
}