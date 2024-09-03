import { Request, Response } from 'express';
import AuthService from './auth.service';
import { ErrorResponse } from '../../common/types/errorTypes';
import { plainToClass } from 'class-transformer';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { AppPasswordDTO } from './dtos/appPassword.dto';

class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const registerData = plainToClass(RegisterDTO, req.body);
            const {email, password} = registerData
            const user = await AuthService.register(email, password);
            res.status(201).json(user);
        } catch (error) {
            if ((error as ErrorResponse).status && (error as ErrorResponse).message) {
                res.status((error as ErrorResponse).status).json({ message: (error as ErrorResponse).message });
            } else {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const loginData = plainToClass(LoginDTO, req.body);
            const { email, password } = loginData;
            const { token, user } = await AuthService.login(email, password);
            // res.json({ token, user });
            res.cookie('authToken', token, { httpOnly: true });
            return res.redirect('/');
        } catch (error) {
            if ((error as ErrorResponse).status && (error as ErrorResponse).message) {
                res.status((error as ErrorResponse).status).json({ message: (error as ErrorResponse).message });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    }

    static async saveAppPassword(req: Request, res: Response): Promise<void> {
        try {
            const { userId, appPassword } = req.body;

            if (!userId || !appPassword) {
                res.status(400).json({ message: 'Missing userId or appPassword' });
                return;
            }

            const userIdNumber = parseInt(userId, 10);
            if (isNaN(userIdNumber)) {
                res.status(400).json({ message: 'Invalid userId format' });
                return;
            }

            const appPasswordDTO = new AppPasswordDTO();
            appPasswordDTO.appPassword = appPassword;

            const user = await AuthService.saveAppPassword(userIdNumber, appPasswordDTO);

            res.redirect('/dashboard');
        } catch (error: any) {
           res.status(500).json({message: error.message})
           console.log(error.message);
        }
    }
}

export default AuthController;
