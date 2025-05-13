import Joi from 'joi'
import bcrypt from 'bcrypt'
import { GET_DB } from '~/config/mongodb'
import { USER_ROLE } from '~/utils/constants'
import { v4 } from 'uuid'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
    uuid: Joi.string().default(v4()),
    userName: Joi.string().min(3).max(50).trim().strict().required(),
    email: Joi.string().min(3).max(256).trim().strict().required(),
    password: Joi.string().min(3).trim().strict().required(),
    fullName: Joi.string().min(3).max(50).trim().strict().default(`user${Math.floor(Math.random() * 900000000)}`),
    phone: Joi.string().min(3).max(256).trim().strict().default(''),
    avatar: Joi.string().trim().default(''),
    imageHeader: Joi.string().trim().default(''),
    refreshToken: Joi.string().trim().default(''),

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

const getUser = async (fieldName, data) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
            [fieldName]: data
        })
    } catch (error) {
        throw new Error(error)
    }
}

const updateProfile = async(fieldName, uuid, data) => {
    try {
        if (fieldName === 'password') {
            const messageUpload = await GET_DB().collection(USER_COLLECTION_NAME).updateOne(
                { uuid: uuid },
                { $set: { [fieldName]: await bcrypt.hash(data, 10) } }
            )
            return messageUpload
        }
        const messageUpload = await GET_DB().collection(USER_COLLECTION_NAME).updateOne(
            { uuid: uuid },
            { $set: { [fieldName]: data } }
        )
        return messageUpload
    } catch (error) {
        throw new Error(error)
    }
}

const getOne = async(fieldName, uuid) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne(
            { uuid: uuid },
            { projection: { [fieldName]: 1, _id: 0 } }
        )
    } catch (error) {
        throw new Error(error)
    }
}

export const userModel = {
    USER_COLLECTION_NAME,
    USER_COLLECTION_SCHEMA,
    register,
    updateProfile,
    getOne,
    getUser
}