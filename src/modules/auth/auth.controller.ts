import { Request, Response } from 'express';
import AuthService from './auth.service';
import { ErrorResponse } from '../../common/types/errorTypes';
import { plainToClass } from 'class-transformer';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { AppPasswordDTO } from './dtos/appPassword.dto';
import { HttpException } from '../../common/exceptions/HttpExceptions';
import HttpStatusCodes from '../../common/constants/http-status-codes';

class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const registerData = plainToClass(RegisterDTO, req.body);
            const {email, password, role} = registerData
            const user = await AuthService.register(email, password, role);
            res.status(201).json(user);
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const loginData = plainToClass(LoginDTO, req.body);
            const { email, password } = loginData;
            const { token, user } = await AuthService.login(email, password);
            // return res.json({ token, user });
            res.cookie('authToken', token, { httpOnly: true });
            return res.redirect('/');
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }

    static async addBroadcast(req: Request, res: Response) {
        try {
            const { email, appPassword } = req.body;

            const newBroadcaster = await AuthService.addBroadcaster(email, appPassword);

            res.status(201).json({
                message: 'Broadcaster created successfully',
                broadcaster: newBroadcaster,
            });
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }
}

export default AuthController;
