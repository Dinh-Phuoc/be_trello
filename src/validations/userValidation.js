import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import ApiError from '~/utils/ApiError'
const EMAIL_VALIDATE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const login = async (req, res, next) => {
    const correctCondition = Joi.object({
        userName: Joi.string().required().min(6).trim().strict(),
        password: Joi.string().required().min(6).trim().strict()
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const register = async (req, res, next) => {
    const correctCondition = Joi.object({
        userName: Joi.string().required().min(6).trim().strict(),
        password: Joi.string().required().min(6).trim().strict(),
        email: Joi.string().pattern(EMAIL_VALIDATE).message('Không đúng định dạng email').required().trim().strict()
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const updateProfile = async (req, res, next) => {
    const correctCondition = Joi.object({
        data: Joi.string().trim().strict(),
        presentPassword: Joi.string().min(6).trim().strict(),
        newPassword: Joi.string().min(6).trim().strict()
    })

    try {
        if (req.params.fieldName === 'password') {
            const data = req.body
            await correctCondition.validateAsync(data, { abortEarly: false })
            return next()
        }
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}
export const userValidation = {
    login,
    register,
    updateProfile
}