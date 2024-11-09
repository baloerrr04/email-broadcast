import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '../common/exceptions/HttpExceptions';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import AuthRepository from '../modules/auth/auth.repository';
import { User } from '@prisma/client';


export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['authToken'];

    if (token) {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error("JWT Secret not configured");

            jwt.verify(token, secret);

            return res.redirect('/');
        } catch (error) {
            return next();
        }
    } else {
        return next();
    }
}


interface DecodedToken {
    userId: number;
}

export async function getAuthorization(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['authToken'];

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT Secret not configured");
        const decoded = jwt.verify(token, secret) as DecodedToken;

        // Fetch the full user object
        const user = await AuthRepository.findById(decoded.userId);
        if (!user) throw new Error("User not found");

        req.user = user; // Ensure that `req.user` matches the `User` type

        next();
    } catch (error: any) {
        res.redirect('/login');
    }
}

export function authorizeRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && (req.user as User).role === role) {
            next(); // Lanjutkan jika peran cocok
        } else {
            res.status(403).send("Access Denied");
        }
    };
}

export function validationMiddleware<T>(type: any): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        const input = plainToInstance(type, req.body);
        validate(input).then(errors => {
            if (errors.length > 0) {
                const messages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join(', ');
                res.status(400).json({ message: messages });
            } else {
                req.body = input;
                next();
            }
        });
    };
}

export const refreshUserData = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        const userId = (req.user as User).id;
        const updatedUser = await AuthRepository.findById(userId);
        if (updatedUser) {
            req.user = updatedUser;
        }
    }
    next();
};
