import { Broadcaster, Role } from "@prisma/client";
import { User } from "../../common/types/userTypes";
import { prisma } from "../../config/database";

class AuthRepository {
    static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        }) as unknown as User;
    }

    static async findById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        }) as unknown as User;
    }

    static async createUser(user: { email: string, password: string, role: Role }): Promise<User | null> {
        return prisma.user.create({
            data: {
                ...user,
                role: user.role
            },
        }) as unknown as User;
    }

    static async createBroadcaster(broadcaster: {email: string, appPassword:string}): Promise<Broadcaster | null> {
        return prisma.broadcaster.create({
            data: {
                ...broadcaster
            }
        })
    }

    static async findByEmailBroadcaster(email: string): Promise<Broadcaster | null> {
        return prisma.broadcaster.findUnique({
            where: {email}
        })
    }
    
    // static async updateUser(id: number, appPassword: string): Promise<User | null> {
    //     return prisma.user.update({
    //         where: { id },
    //         data: {
    //             appPassword: appPassword
    //         }
    //     });
    // }
}

export default AuthRepository