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
            const {email, password, role} = registerData
            const user = await AuthService.register(email, password, role);
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
            // return res.json({ token, user });
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

    static async addBroadcast(req: Request, res: Response) {
        try {
            const { email, appPassword } = req.body;

            // Memanggil service untuk menambahkan broadcaster baru
            const newBroadcaster = await AuthService.addBroadcaster(email, appPassword);

            // Mengembalikan response dengan status 201 dan data broadcaster baru
            res.status(201).json({
                message: 'Broadcaster created successfully',
                broadcaster: newBroadcaster,
            });
        } catch (error: any) {
            console.log(error.message);
            
        }
    }
}

export default AuthController;
