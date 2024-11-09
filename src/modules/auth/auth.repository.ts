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