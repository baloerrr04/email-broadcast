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
import HttpStatusCodes from '../../common/constants/http-status-codes';

class MailController {

    // static async getEmailsByStatus(req: Request, res: Response) {
    //     try {
    //         const userId = (req.user as { id: number }).id;
    //         if (userId === undefined) {
    //             return res.status(400).json({ message: 'User ID is not available' });
    //         }
    //         const status = req.params.status;
    //         const emails = await MailRepository.findByUserIdAndStatus(userId, status);
        
    //         if (status === "Terkirim") {
    //             res.render('index.ejs', { emails, user: req.user, title: 'Broadcast' });
    //         } else if (status === "Menunggu") {
    //             res.render('scheduled.ejs', { emails, user: req.user, title: 'Scheduled Emails' });
    //         } else {
    //             res.status(400).json({ message: 'Invalid status' });
    //         }
    //     } catch (error: any) {
    //         res.status(500).json({ message: error.message });
    //     }
    // }


    static async sendEmail(req: Request, res: Response) {
        try {
            const { userId, from, to, cc, bcc, subject, content, scheduleDate, scheduleTime } = req.body;
            const user = await AuthRepository.findById(parseInt(userId))
            const broadcaster = await AuthRepository.findByEmailBroadcaster(from)

            if (!user) throw new HttpException(400, "Broadcaster not found or app password not set");
            if (!broadcaster || !broadcaster.appPassword) throw new HttpException(400, "Broadcaster not found or app password not set");

            const mailService = new MailService();
            mailService.configure(from, broadcaster.appPassword);


            const emailData: EmailData = { userId: user.id, broadcasterId: broadcaster.id, from, to, cc, bcc, subject, content, status: "Menunggu" };
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
                await MailRepository.updateEmailStatus(email.id, "Menunggu");
            }

            res.redirect('/');
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deleteEmail(req: Request, res: Response) {
        try {
            const { id } = req.params
            await MailService.deleteEmail(parseInt(id));
            res.redirect('/')
            return
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }
}

export default MailController;
