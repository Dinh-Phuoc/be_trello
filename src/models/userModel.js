import Joi from 'joi'
import bcrypt from 'bcrypt'
import { GET_DB } from '~/config/mongodb'
import { USER_ROLE } from '~/utils/constants'
import { ObjectId } from 'mongodb'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
    userName: Joi.string().required().min(3).max(50).trim().strict(),
    fullName: Joi.string().min(3).max(50).trim().strict(),
    password: Joi.string().required().min(3).trim().strict(),
    gmail: Joi.string().min(3).max(256).trim().strict(),
    phone: Joi.string().min(3).max(256).trim().strict(),
    avatar: Joi.string().min(3).trim().strict(),

    _destroy: Joi.boolean().default(false),
    role: Joi.string().valid(USER_ROLE.ADMIN, USER_ROLE.GUEST).default('guest'),
    createdAt: Joi.date().timestamp('javascript').default(Date.now()),
    updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
    return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const register = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const bcryptData = {
            ...validData,
            password: await bcrypt.hash(data.password, 10)
        }
        return await GET_DB().collection(USER_COLLECTION_NAME).insertOne(bcryptData)
    } catch (error) {
        throw new Error(error)
    }
}

const login = async (data) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
            $or:[
                { userName: data.userName },
                {
                    $and: [
                        { userName: data.userName },
                        { password: data.password }
                    ]
                }
            ]
        })
    } catch (error) {
        throw new Error(error)
    }
}


export const userModel = {
    USER_COLLECTION_NAME,
    USER_COLLECTION_SCHEMA,
    register,
    login
}