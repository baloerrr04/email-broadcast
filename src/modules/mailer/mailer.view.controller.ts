import { Request, Response } from 'express';
import MailRepository from './mailer.repository';
import moment from 'moment';
import MailService from './mailer.service';

class MailerViewController {
    static currentRoute: string;

    static async modifyEmails(userId: number, status: string) {
        const emails = await MailRepository.findByUserIdAndStatus(userId, status);
        return emails.map((email) => {
            const displayDates = email.schedules.length > 0
                ? email.schedules.map((schedule) => {
                    const displayDate = moment(schedule.scheduleDate).add(-7, 'hours').format('DD/MM/YYYY HH:mm');
                    const isPast = moment(schedule.scheduleDate).add(-7, 'hours').isBefore(moment());
                    return { displayDate, isPast };
                })
                : [{ displayDate: moment(email.createdAt).format('DD/MM/YYYY HH:mm'), isPast: true }];

            return {
                ...email,
                displayDates,
            };
        });
    }

    static async checkUserAndRender(req: Request, res: Response, status: string, view: string, title: string) {
        if (req.user) {
            const userId = (req.user as { id: number }).id;
            const emailsModified = await MailerViewController.modifyEmails(userId, status);


            console.log(emailsModified);


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

            console.log(broadcasters);


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

    static async editMailPage(req: Request, res: Response) {
        if (req.user) {
            const broadcasters = await MailRepository.findBroadcaster();

            const emailId = req.params.id;
            const email = await MailService.findEmailById(parseInt(emailId));

            // console.log(email);

            if (email && email.content) {
                email.content = email.content.replace(/<img src="uploads\//g, '<img src="../../uploads/');
            }

            const formattedSchedules = email.schedules.map((schedule, index) => {
                const datetime = schedule.scheduleDate.toISOString();
                const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;
                const match = datetime.match(regex);

                if(match) {
                    const date = match[1]
                    console.log(date);
                }
                

                return match
                    ? { date: match[1], time: match[2] } // Jika cocok, simpan tanggal dan waktu
                    : { date: '', time: '' }; // Jika tidak, simpan kosong
            })

            MailerViewController.currentRoute = `/emails/${emailId}/edit`;

            res.render('edit-email.ejs', {
                user: req.user,
                title: 'Edit Email',
                broadcasters,
                formattedSchedules,
                email,
                currentRoute: MailerViewController.currentRoute, // Kirim currentRoute ke view
            });
        } else {
            res.redirect('/login');
        }
    }

}

export default MailerViewController;
