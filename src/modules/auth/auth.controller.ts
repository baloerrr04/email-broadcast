import { Request, Response } from 'express';
import AuthService from './auth.service';
import { plainToClass } from 'class-transformer';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { HttpException } from '../../common/exceptions/HttpExceptions';
import HttpStatusCodes from '../../common/constants/http-status-codes';
import AuthRepository from './auth.repository';
import bcrypt from "bcrypt";


class AuthController {
    
    static async login(req: Request, res: Response) {
        try {
            const loginData = plainToClass(LoginDTO, req.body);
            const { email, password } = loginData;
    
            const user = await AuthRepository.findByEmail(email);
            if (!user) {
                return res.status(401).render('login', { message: "Email address not registered." });
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).render('login', { message: "Incorrect password." });
            }
    
            const { token } = await AuthService.login(email, password);
    
            res.cookie('authToken', token, { httpOnly: true });
    
            if (user.role === 'ADMIN') {
                return res.redirect('/admin');
            } else if (user.role === 'USER') {
                return res.redirect('/');
            } else {
                return res.redirect('/');
            }
    
        } catch (error: any) {
            return res.status(400).render('login', { message: error.message });
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
