import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formartter'
import { env } from '~/config/environment'
import crypto from 'crypto'
import { base64url } from '~/utils/base64url'

const createNew = async (reqBody) => {
    const newUser = {
        ...reqBody,
        slug: slugify(reqBody.title)
    }
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    return getNewUser
}

const login = async (body) => {
    const user = await userModel.login(body)
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản hoặc mật khẩu không chính xác')

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    }

    const payload = {
        userName: user.userName,
        iat: Date.now()
    }

    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))

    const tokenData = `${encodedHeader}.${encodedPayload}`

    const hmac = crypto.createHmac('sha256', env.SECRETKEY)
    const signature = hmac.update(tokenData).digest('base64url')
    return `${tokenData}.${signature}`
}
export const loginService = {
    createNew,
    login
}