import AdminRepository from './admin.repository'
import { HttpException } from '../../common/exceptions/HttpExceptions';
import HttpStatusCodes from '../../common/constants/http-status-codes';
import { Broadcaster, Role, User } from '@prisma/client';


import bcrypt from 'bcrypt';


class AdminService {
    static async getAllUser(id: number) {
        const users = await AdminRepository.findAllUser(id);

        if(!users) throw new HttpException(HttpStatusCodes.NOT_FOUND, "Users not found");
        
        return users;
    }

    static async addUser(email: string, password: string, role: Role): Promise<User> {
        const existingUser = await AdminRepository.findByEmail(email);

        if (existingUser) throw new HttpException(HttpStatusCodes.BAD_REQUEST, "User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await AdminRepository.createUser({ email, password: hashedPassword, role });

        if (!newUser) throw new HttpException(HttpStatusCodes.INTERNAL_SERVER_ERROR, "User registration failed");

        return newUser;
    }

    static async getAllBroadcaster() {
        const broadcasters = await AdminRepository.findAllBroadcaster();

        if(!broadcasters) throw new HttpException(HttpStatusCodes.NOT_FOUND, "Broadcasters not found");
        
        return broadcasters;
    }

    static async getAllEmail() {
        const emails = await AdminRepository.findAllEmail();

        if(!emails) throw new HttpException(HttpStatusCodes.NOT_FOUND, "Emails not found");

        return emails;
    }

    static async getUserById(id: number) {
        const user = await AdminRepository.findUserById(id);

        if(!user) throw new HttpException(HttpStatusCodes.NOT_FOUND, "Users not found");
        
        return user;
    }

    static async getBroadcasterById(id: number) {
        const broadcaster = await AdminRepository.findByIdBroadcaster(id);

        if(!broadcaster) throw new HttpException(HttpStatusCodes.NOT_FOUND, "Broadcasters not found");

        return broadcaster;
    }

    static async addBroadcaster(email: string, appPassword: string) {
        const existingBroadcaster = await AdminRepository.findByEmailBroadcaster(email);

        if (existingBroadcaster) throw new HttpException(HttpStatusCodes.BAD_REQUEST, "Broadcaster already exists");

        const newBroadcaster = await AdminRepository.createBroadcaster({ email, appPassword });
        
        if (!newBroadcaster) throw new HttpException(HttpStatusCodes.INTERNAL_SERVER_ERROR, "User registration failed");
        return newBroadcaster;
    }

    static async deleteUserById(id: number) {
        const existingUser = await AdminRepository.findUserById(id);

        if (!existingUser) throw new HttpException(HttpStatusCodes.NOT_FOUND, `Broadcaster with id ${id} is not found`);

        return await AdminRepository.deleteUser(id);
    }

    static async deleteBroadcasterById(id: number) {
        const existingBroadcaster = await AdminRepository.findByIdBroadcaster(id);

        if (!existingBroadcaster) throw new HttpException(HttpStatusCodes.NOT_FOUND, `Broadcaster with id ${id} is not found`);

        return await AdminRepository.deleteBroadcaster(id);
    }

    static async updateUser(id: number, userData: { email: string, password?: string, role: Role }): Promise<User | null> {
        const existingUser = await AdminRepository.findUserById(id);

        if (!existingUser) {
            throw new HttpException(HttpStatusCodes.NOT_FOUND, `User with id ${id} is not found`);
        }

        return AdminRepository.updateUser(id, userData);
    }
    
    static async updateBroadcaster(id: number, broadcasterData: { email?: string, appPassword?: string }): Promise<Broadcaster | null> {
        const existingBroadcaster = await AdminRepository.findByIdBroadcaster(id);

        if (!existingBroadcaster) {
            throw new HttpException(HttpStatusCodes.NOT_FOUND, `Broadcaster with id ${id} is not found`);
        }

        return AdminRepository.updateBroadcaster(id, broadcasterData);
    }
}

export default AdminService;