import { Request, Response } from 'express';
import MailRepository from './mailer.repository';
import moment from 'moment';

class MailerViewController {
    static currentRoute: string;

    static async modifyEmails(userId: number, status: string) {
        const emails = await MailRepository.findByUserIdAndStatus(userId, status);
        return emails.map((email) => {
            const displayDate = email.schedules.length > 0 
                ? moment(email.schedules[0].scheduleDate).add(17, 'hours').format('DD/MM/YYYY HH:mm')
                : moment(email.createdAt).format('DD/MM/YYYY HH:mm');
            return {
                ...email,
                displayDate,
            };
        });
    }

    static async checkUserAndRender(req: Request, res: Response, status: string, view: string, title: string) {
        if (req.user) {
            const userId = (req.user as { id: number }).id;
            const emailsModified = await MailerViewController.modifyEmails(userId, status);

            res.render(view, {
                user: req.user,
                title,
                emails: emailsModified,
                currentRoute: MailerViewController.currentRoute,
            });
        } else {
            res.redirect('/login');
        }
    }

    static async sentMailPage(req: Request, res: Response) {
        MailerViewController.currentRoute = '/';
        await MailerViewController.checkUserAndRender(req, res, "Terkirim", 'index.ejs', 'Broadcast');
    }

    // Scheduled mail page handler
    static async scheduledMailPage(req: Request, res: Response) {
        MailerViewController.currentRoute = '/scheduled';
        await MailerViewController.checkUserAndRender(req, res, "Menunggu", 'scheduled-email.ejs', 'Broadcast');
    }

    // Send mail page handler
    static async sendMailPage(req: Request, res: Response) {
        if (req.user) {
            const broadcasters = await MailRepository.findBroadcaster();
            MailerViewController.currentRoute = '/send-email';

            res.render('add-email.ejs', {
                user: req.user,
                title: 'Send Email',
                broadcasters,
                currentRoute: MailerViewController.currentRoute,
            });
        } else {
            res.redirect('/login');
        }
    }
}

export default MailerViewController;
