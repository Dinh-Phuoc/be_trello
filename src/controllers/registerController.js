import { StatusCodes } from 'http-status-codes'
import { registerService } from '~/services/registerService'

const register = async (req, res, next) => {
    try {
        const register = await registerService.register(req.body)
        res.status(StatusCodes.OK).json(register)
    } catch (error) {
        next(error)
    }
}
export const registerController = {
    register
}