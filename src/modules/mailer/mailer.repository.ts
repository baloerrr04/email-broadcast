import { EmailData, EmailScheduleData, EmailWithSchedules } from '../../common/types/mailTypes'
import { prisma } from "../../config/database";

class MailRepository {
    static async addEmail(emailData: EmailData): Promise<EmailWithSchedules> {
        const email = await prisma.email.create({
            data: {
                userId: emailData.userId,
                to: emailData.to,
                cc: emailData.cc || null,
                bcc: emailData.bcc || null,
                subject: emailData.subject,
                content: emailData.content,
            },
            include: { schedules: true },
        });

        return {
            ...email,
            schedules: email.schedules.map(schedule => ({
                emailId: schedule.emailId,
                scheduleDate: schedule.scheduleDate,
            }))
        } as EmailWithSchedules;
    }

    static async addEmailSchedule(emailId: number, scheduleDates: Date[]): Promise<void> {
        const schedules = scheduleDates.map(date => ({
            emailId,
            scheduleDate: date,
        }));

        console.log('Adding schedules:', schedules); // Debugging log

        await prisma.emailSchedule.createMany({
            data: schedules,
        });

        console.log('Email schedules inserted:', schedules); // Add this line to debug
    }

    static async findById(id: number): Promise<EmailWithSchedules | null> {
        const email = await prisma.email.findUnique({
            where: { id },
            include: { schedules: true },
        });

        if (!email) return null;

        return {
            ...email,
            schedules: email.schedules.map(schedule => ({
                emailId: schedule.emailId,
                scheduleDate: schedule.scheduleDate,
            })),
        } as EmailWithSchedules;
    }

    static async findByUserIdAndStatus(userId: number, status: string): Promise<EmailWithSchedules[]> {
        const emails = await prisma.email.findMany({
            where: { userId, status },
            include: { schedules: true },
            orderBy: { createdAt: 'desc'}
        });

        return emails.map(email => ({
            ...email,
            schedules: email.schedules.map(schedule => ({
                emailId: schedule.emailId,
                scheduleDate: schedule.scheduleDate,
            })),
        })) as EmailWithSchedules[];
    }

    static async deleteEmailById(id: number): Promise<void> {

        await prisma.emailSchedule.deleteMany({
            where: {emailId: id }
        })

        await prisma.email.delete({
            where: { id }
        })

        return
    }


    static async updateEmail(emailId: number, emailData: EmailData): Promise<void> {
        await prisma.email.update({
            where: { id: emailId },
            data: {
                to: emailData.to,
                cc: emailData.cc,
                bcc: emailData.bcc,
                subject: emailData.subject,
                content: emailData.content,
            },
        });
    }

    static async updateEmailSchedules(emailId: number, schedules: EmailScheduleData[]): Promise<void> {
        await prisma.emailSchedule.deleteMany({
            where: { emailId },
        });
    
        await prisma.emailSchedule.createMany({
            data: schedules.map(schedule => ({
                emailId: schedule.emailId,
                scheduleDate: schedule.scheduleDate,
            })),
        });
    }

    static async updateEmailStatus(emailId: number, status: string): Promise<void> {
        await prisma.email.update({
            where: { id: emailId},
            data: {
                status
            }
        })
    }
 }

export default MailRepository;