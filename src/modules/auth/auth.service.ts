import bcrypt from "bcrypt";
import AuthRepository from "./auth.repository";
import { User } from "../../common/types/userTypes";
import { Profile } from "passport-google-oauth20"
import jwt from "jsonwebtoken";
import MailService from "../mailer/mailer.service";
import { HttpException } from "../../common/exceptions/HttpExceptions";
import { AppPasswordDTO } from "./dtos/appPassword.dto";
import httpStatusCodes from "../../common/constants/http-status-codes"

class AuthService {

    private static readonly JWT_SECRET = process.env.JWT_SECRET;

    static async register(email: string, password: string): Promise<User> {
        const existingUser = await AuthRepository.findByEmail(email);

        if (existingUser) throw new HttpException(httpStatusCodes.BAD_REQUEST, "User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await AuthRepository.createUser({ email, password: hashedPassword });

        if (!newUser) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "User registration failed");

        return newUser;
    }

    static async login(email: string, password: string): Promise<{ token: string, user: User }> {
        const user = await AuthRepository.findByEmail(email);
        if (!user) throw new HttpException(httpStatusCodes.UNAUTHORIZED, "Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new HttpException(httpStatusCodes.UNAUTHORIZED, "Invalid credentials");

        if (!AuthService.JWT_SECRET) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "JWT Secret not configured");

        const token = jwt.sign({ userId: user.id }, AuthService.JWT_SECRET, { expiresIn: '1h' });
        return { token, user };
    }

    static async loginGoogle(profile: Profile): Promise<{ token: string, user: User }> {
        if (!profile.emails || profile.emails.length === 0) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "Google account does not have an email");

        const email = profile.emails[0].value;
        let user = await AuthRepository.findByEmail(email);

        if (!user) {
            user = await AuthRepository.createUser({
                email: email,
                // name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
                password: bcrypt.hashSync(Math.random().toString(36).substring(7), 10),
            });

            if (!user) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "User creation failed");
        }

        if (!AuthService.JWT_SECRET) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "JWT Secret not configured");

        const token = jwt.sign({ userId: user.id }, AuthService.JWT_SECRET, { expiresIn: '1h' });
        return { token, user };
    }

    static async saveAppPassword(userId: number, appPassword: AppPasswordDTO): Promise<User> {
        const user = await AuthRepository.findById(userId);

        if (!user) throw new HttpException(httpStatusCodes.NOT_FOUND, `User with id ${userId} not found`);

        // const hashedAppPassword = await bcrypt.hash(appPassword, 10);
        const updatedUser = await AuthRepository.updateUser(userId, appPassword.appPassword);

        if (!updatedUser) throw new HttpException(httpStatusCodes.INTERNAL_SERVER_ERROR, "Saving app password failed");

        const mailService = new MailService()
        mailService.configure(user.email, appPassword.appPassword)

        return updatedUser;
    }
}

export default AuthService