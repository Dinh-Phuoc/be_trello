import { userModel } from '~/models/userModel'

const register = async (reqBody) => {
    const createdRegister = await userModel.register(reqBody)
    const getNewRegister = await userModel.login(createdRegister.insertedId)

    return getNewRegister
}

export const registerService = {
    register
}