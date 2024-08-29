import { Request, Response } from 'express';
import MailService from './mailer.service';
import AuthRepository from '../auth/auth.repository';
import moment from 'moment';
import cron from "node-cron";
import { HttpException } from '../../common/exceptions/HttpExceptions';
import { EmailData, EmailScheduleData } from '../../common/types/mailTypes';
import MailRepository from './mailer.repository';
import * as Cheerio from 'cheerio';
import axios from 'axios';

class MailController {

    static async getEmails(req: Request, res: Response) {
        try {
            const userId = parseInt(req.query.userId as string);
            const status = req.query.status as string;
            const emails = await MailRepository.findByUserIdAndStatus(userId, status);
            res.status(200).json(emails);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }


    static async sendEmail(req: Request, res: Response) {
        try {
            const { userId, to, cc, bcc, subject, content, scheduleDate, scheduleTime } = req.body;
            const user = await AuthRepository.findById(parseInt(userId));

            if (!user || !user.appPassword) throw new HttpException(400, "User not found or app password not set");

            const mailService = new MailService();
            mailService.configure(user.email, user.appPassword);



            const emailData: EmailData = { userId: user.id, to, cc, bcc, subject, content, status: "Menunggu" };
            const email = await MailRepository.addEmail(emailData);


            const baseUrl = 'http://localhost:3000/';

            const downloadImage = async (url: string, filename: string) => {
                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    return {
                        filename,
                        content: Buffer.from(response.data),
                        cid: `image${new Date().getTime()}.nodemailer`
                    };
                } catch (error) {
                    console.error('Error downloading image:', url, error);
                    throw error;
                }
            };

            const $ = Cheerio.load(content);
            const attachments: any[] = [];

            const promises = $('img').map(async (index, img) => {
                let src = $(img).attr('src');
                console.log('Image src:', src);

                if (src) {
                    if (src.startsWith('data:')) {
                        console.log("src1: ", src);
                        const base64Data = src.split(';base64,').pop();
                        if (base64Data) {
                            const filename = `image${index}.png`;
                            const cid = `image${index}@${new Date().getTime()}.nodemailer`;
                            attachments.push({
                                filename,
                                content: Buffer.from(base64Data, 'base64'),
                                cid
                            });
                            $(img).attr('src', `cid:${cid}`);
                        }
                    } else {
                        src = baseUrl + src
                        const filename = `image${index}.png`;
                        try {
                            console.log('Downloading image from:', src);
                            const imageAttachment = await downloadImage(src, filename);
                            attachments.push(imageAttachment);
                            $(img).attr('src', `cid:${imageAttachment.cid}`);
                        } catch (error) {
                            console.error('Failed to download image:', src, error);
                        }
                    }
                } else {
                    console.error('Image src is missing');
                }
            }).get();

            await Promise.all(promises);

            const updatedContent = $.html();

            if (!scheduleDate || scheduleDate.length === 0) {
                await mailService.sendMail(user.email, to.split(','), cc?.split(',') || [], bcc?.split(',') || [], subject, updatedContent, attachments);
                await MailRepository.updateEmailStatus(email.id, "Terkirim");
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
                        await mailService.sendMail(user.email, to.split(','), cc?.split(',') || [], bcc?.split(',') || [], subject, updatedContent, attachments);
                        await MailRepository.updateEmailStatus(email.id, "Terkirim");
                    });
                }

                await MailRepository.addEmailSchedule(email.id, schedulesDB);
            }

            res.redirect('/');
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
}

export default MailController;
