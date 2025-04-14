import { StatusCodes } from 'http-status-codes'
import { loginService } from '~/services/loginService'

const login = async (req, res, next) => {
    try {
        const login = await loginService.login(req.body)
        res.status(StatusCodes.OK).json(login)
    } catch (error) {
        next(error)
    }
}
export const loginController = {
    login
}