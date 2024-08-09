import { User } from "../../common/types/userTypes";
import { prisma } from "../../config/database";

class AuthRepository {
    static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    static async findById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        })
    }

    static async createUser(user: { email: string, password: string }): Promise<User | null> {
        return prisma.user.create({
            data: user
        })
    }
    
    static async updateUser(id: number, appPassword: string): Promise<User | null> {
        return prisma.user.update({
            where: { id },
            data: {
                appPassword: appPassword
            }
        });
    }
}

export default AuthRepository