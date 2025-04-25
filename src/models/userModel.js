import Joi from 'joi'
import bcrypt from 'bcrypt'
import { GET_DB } from '~/config/mongodb'
import { USER_ROLE } from '~/utils/constants'
import { ObjectId } from 'mongodb'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
    userName: Joi.string().min(3).max(50).trim().strict().required(),
    email: Joi.string().min(3).max(256).trim().strict().required(),
    password: Joi.string().min(3).trim().strict().required(),
    fullName: Joi.string().min(3).max(50).trim().strict(),
    phone: Joi.string().min(3).max(256).trim().strict().default(''),
    avatar: Joi.string().min(3).trim().strict().default(''),

    _destroy: Joi.boolean().default(false),
    role: Joi.string().valid(USER_ROLE.ADMIN, USER_ROLE.GUEST).default('guest'),
    createdAt: Joi.date().timestamp('javascript').default(Date.now()),
    updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
    if (!data.fullName) {
        data.fullName = data.userName
    }
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

const getUser = async (payload) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
            $or: [
                { userName: payload.userName },
                { _id: new ObjectId(payload.id) }
            ]
        })
    } catch (error) {
        throw new Error(error)
    }
}

const updateProfile = async(fieldName, id, data) => {
    try {
        if (fieldName === 'password') {
            const messageUpload = await GET_DB().collection(USER_COLLECTION_NAME).updateOne(
                { _id: new ObjectId(id) },
                { $set: { [fieldName]: await bcrypt.hash(data, 10) } }
            )
            return messageUpload
        }
        const messageUpload = await GET_DB().collection(USER_COLLECTION_NAME).updateOne(
            { _id: new ObjectId(id) },
            { $set: { [fieldName]: data } }
        )
        return messageUpload
    } catch (error) {
        throw new Error(error)
    }
}

const getOne = async(fieldName, id) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne(
            { _id: new ObjectId(id) },
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