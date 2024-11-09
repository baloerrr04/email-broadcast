import bcrypt from "bcrypt";
import AuthRepository from "./auth.repository";
import AdminRepository from "../admin/admin.repository";
import { User } from "../../common/types/userTypes";
import jwt from "jsonwebtoken";
import { HttpException } from "../../common/exceptions/HttpExceptions";
import httpStatusCodes from "../../common/constants/http-status-codes"
import { Broadcaster, Role } from "@prisma/client";

class AuthService {

    private static readonly JWT_SECRET = process.env.JWT_SECRET;

    static async login(email: string, password: string): Promise<{ token: string, user: User }> { 
        const user = await AuthRepository.findByEmail(email);
        if (!user) {
            throw new HttpException(httpStatusCodes.UNAUTHORIZED, "Email address not registered.");
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpException(httpStatusCodes.UNAUTHORIZED, "Incorrect password.");
        }
    
        if (!AuthService.JWT_SECRET) {
            throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "JWT Secret not configured.");
        }
    
        const token = jwt.sign({ userId: user.id }, AuthService.JWT_SECRET, { expiresIn: '1h' });
        return { token, user };
    }
    

    static async addBroadcaster(email: string, appPassword: string): Promise<Broadcaster> {
        const existingBroadcaster = await AdminRepository.findByEmailBroadcaster(email);

        if (existingBroadcaster) throw new HttpException(httpStatusCodes.BAD_REQUEST, "Broadcaster already exists");

        const newBroadcaster = await AdminRepository.createBroadcaster({ email, appPassword });
        
        if (!newBroadcaster) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "User registration failed");
        return newBroadcaster
    }

    static async verifyCaptcha(token: string) {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: '6Le4DXYqAAAAABOwobBd9qq7zrMjfmLnBGg19apR',
                response: token,
            }),
        });
        const data = await response.json();
        console.log('CAPTCHA Verification Response:', data); // Log the entire response
        return data.success; 
    }
}

export default AuthService