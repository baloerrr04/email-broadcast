import { Broadcaster, Role, User } from "@prisma/client";
import { prisma } from "../../config/database";
import { EmailWithSchedules } from "../../common/types/mailTypes";

class AdminRepository {
    static async findAllUser(loggedInUserId: number)  {
        const users = prisma.user.findMany({
            where: {
                id: {
                    not: loggedInUserId
                }
            }
        });
        return users;
    }

    static async findAllBroadcaster() {
        const broadcasters = prisma.broadcaster.findMany();
        return broadcasters;
    }

    static async findAllEmail(): Promise<EmailWithSchedules[]> {
        const emails = await prisma.email.findMany({
            include: {schedules: true},
            orderBy: { createdAt: 'desc' }
        });

        return emails.map(email => ({
            ...email,
            schedules: email.schedules.map(
                schedule => ({
                    emailId: schedule.emailId,
                    scheduleDate: schedule.scheduleDate
                })),
        })) as EmailWithSchedules[]
    }

    static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
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

    static async createBroadcaster(broadcaster: { email: string, appPassword: string }) {
        return prisma.broadcaster.create({
            data: {
                ...broadcaster
            }
        })
    }

    static async findByEmailBroadcaster(email: string) {
        return prisma.broadcaster.findUnique({
            where: { email }
        })
    }

    static async findByIdBroadcaster(id: number) {
        return prisma.broadcaster.findFirst({
            where: {
                id
            }
        })
    }

    static async findUserById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        }) as unknown as User;
    }

    static async deleteBroadcaster(id: number) {
        return prisma.broadcaster.delete({
            where: {
                id
            }
        })
    }

    static async deleteUser(id: number) {
        return prisma.user.delete({
            where: {
                id
            }
        })
    }

    static async deleteEmail(id: number) {
        await prisma.emailSchedule.deleteMany({
            where: { emailId: id }
        });
    
        await prisma.email.delete({
            where: { id }
        });
    
        return;
    }

    static async updateBroadcaster(id: number, broadcasterData: { email?: string, appPassword?: string }): Promise<Broadcaster | null> {
        return prisma.broadcaster.update({
            where: {
                id
            },
            data: {
                ...broadcasterData
            }
        });
    }

    static async updateUser(id: number, userData: { email: string, password?: string, role: Role }): Promise<User | null> {
        return prisma.user.update({
            where: {
                id
            },
            data: {
                ...userData
            }
        });
    }
}

export default AdminRepository;