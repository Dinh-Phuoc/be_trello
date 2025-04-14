import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formartter'
import { env } from '~/config/environment'

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
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    }

    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(body))

    const tokenData = `${encodedHeader}.${encodedPayload}`

    const hmac = crypto.createHmac('sha256', env.SECRETKEY)
    const signature = hmac.update(tokenData).digest('base64url')
    const user = await userModel.login(body)
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    return user
}
export const userService = {
    createNew,
    login
}