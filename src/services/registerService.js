import { userModel } from '~/models/userModel'

const register = async (reqBody) => {
    const createdRegister = await userModel.register(reqBody)
    const messageRegister = createdRegister.insertedId ? 'Đăng ký tài khoản thành công' : 'Đăng ký tài khoản thất bại'
    return messageRegister
}

export const registerService = {
    register
}