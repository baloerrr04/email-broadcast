import { Request, Response } from 'express';
import MailService from './mailer.service';
import AuthRepository from '../auth/auth.repository';
import moment from 'moment';
import cron from "node-cron";
import { HttpException } from '../../common/exceptions/HttpExceptions';
import { EmailData, EmailScheduleData } from '../../common/types/mailTypes';
import MailRepository from './mailer.repository';
import { User } from '../../common/types/userTypes';


class MailController {
    static async sendEmail(req: Request, res: Response) {
        try {
            const { userId, to, cc, bcc, subject, content, scheduleDate, scheduleTime } = req.body;
            const user = await AuthRepository.findById(parseInt(userId));

            if (!user || !user.appPassword) throw new HttpException(400, "User not found or app password not set");

            const mailService = new MailService();
            mailService.configure(user.email, user.appPassword);

            const emailData: EmailData = { userId: user.id, to, cc, bcc, subject, content };
            const email = await MailRepository.addEmail(emailData);

            if (!scheduleDate || scheduleDate.length === 0) {
                await mailService.sendMail(user.email, to.split(','), cc?.split(',') || [], bcc?.split(',') || [], subject, content);
                console.log('Email sent immediately');
            } else {
                const schedules: Date[] = [];
                const schedulesDB: Date[] = [];
                for (let i = 0; i < scheduleDate.length; i++) {
                    const scheduleDateTime = moment(`${scheduleDate[i]} ${scheduleTime[i]}`, 'YYYY-MM-DD HH:mm');
                    const scheduleDateTimeDB = moment(`${scheduleDate[i]} ${scheduleTime[i]}`, 'YYYY-MM-DD HH:mm');
                    schedules.push(scheduleDateTime.toDate());
                    schedulesDB.push(scheduleDateTimeDB.add(7, 'hours').toDate());

                    const cronFormat = `${scheduleDateTime.minutes()} ${scheduleDateTime.hours()} ${scheduleDateTime.date()} ${scheduleDateTime.month() + 1} *`;

                    cron.schedule(cronFormat, async () => {
                        await mailService.sendMail(user.email, to.split(','), cc?.split(',') || [], bcc?.split(',') || [], subject, content);
                        console.log('Email sent successfully at', scheduleDateTime);
                    });
                }

                console.log('Schedules to be added:', schedules); // Debugging log

                await MailRepository.addEmailSchedule(email.id, schedulesDB);
                console.log('Schedules added:', schedules); // Add this line to debug
            }

            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getEmails(req: Request, res: Response) {
        try {
            const userId = parseInt(req.query.userId as string); // Adjust based on your query parameter
            const emails = await MailRepository.findByUserId(userId);
            res.json(emails); // Ensure this returns an array
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deleteEmail(req: Request, res: Response) {
        try {
            const emailId = parseInt(req.params.id, 10);

            if (isNaN(emailId)) {
                return res.status(400).json({ message: 'Invalid email ID' });
            }

            await MailRepository.deleteEmailById(emailId);

            res.status(200).json({ message: 'Email deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async updateEmail(req: Request, res: Response) {
        try {
            const emailId = parseInt(req.params.id);
            const { userId, to, cc, bcc, subject, content, scheduleDate, scheduleTime } = req.body;

            if (!emailId) throw new HttpException(400, 'Email ID is required');
            if (!userId) throw new HttpException(400, 'User ID is required');

            // Temukan user berdasarkan ID
            const user = await AuthRepository.findById(parseInt(userId));
            if (!user) throw new HttpException(400, "User not found");


            if (!user || !user.appPassword) throw new HttpException(400, "User not found or app password not set");

            // Update informasi dasar email
            const emailData: EmailData = {
                userId: user.id,
                to,
                cc: cc || null,
                bcc: bcc || null,
                subject,
                content,
            };

            // Perbarui email dalam database
            await MailRepository.updateEmail(emailId, emailData);

            if (!scheduleDate || scheduleDate.length === 0) {
                // Jika tidak ada jadwal, kirim email segera
                const mailService = new MailService();
                mailService.configure(user.email, user.appPassword);
                await mailService.sendMail(user.email, to.split(','), cc?.split(',') || [], bcc?.split(',') || [], subject, content);
                console.log('Email sent immediately');
            } else {
                // Jika ada jadwal, perbarui jadwal email
                const schedules: Date[] = [];
                const schedulesDB: EmailScheduleData[] = [];
                for (let i = 0; i < scheduleDate.length; i++) {
                    const scheduleDateTime = moment(`${scheduleDate[i]} ${scheduleTime[i]}`, 'YYYY-MM-DD HH:mm');
                    const scheduleDateTimeDB = moment(`${scheduleDate[i]} ${scheduleTime[i]}`, 'YYYY-MM-DD HH:mm');

                    schedules.push(scheduleDateTime.toDate());
                    schedulesDB.push({
                        emailId: emailId,
                        scheduleDate: scheduleDateTimeDB.add(7, 'hours').toDate()
                    });

                    // Tentukan format cron
                    const cronFormat = `${scheduleDateTime.minutes()} ${scheduleDateTime.hours()} ${scheduleDateTime.date()} ${scheduleDateTime.month() + 1} *`;

                    // Jadwalkan pengiriman email
                    cron.schedule(cronFormat, async () => {
                        const mailService = new MailService();

                        if (user.email && user.appPassword) {
                            mailService.configure(user.email, user.appPassword);
                            await mailService.sendMail(user.email, to.split(','), cc?.split(',') || [], bcc?.split(',') || [], subject, content);
                            console.log('Email sent successfully at', scheduleDateTime);
                        } else {
                            console.error('Email or app password is null');
                        }
                    });
                }

                // Perbarui jadwal dalam database
                await MailRepository.updateEmailSchedules(emailId, schedulesDB);
                console.log('Schedules updated:', schedulesDB); // Debugging log
            }

            res.status(200).json({ message: 'Email updated successfully' });
        } catch (error: any) {
            console.error('Error updating email:', error);
            res.status(500).json({ message: error.message });
        }
    }

}

export default MailController;
