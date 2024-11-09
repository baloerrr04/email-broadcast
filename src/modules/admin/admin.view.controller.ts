import { Request, Response } from 'express'
import AdminService from './admin.service'
import path from 'path'
import MailerViewController from '../mailer/mailer.view.controller'
import moment from 'moment'
import { User } from '../../common/types/userTypes'

class AdminViewController {
    static dashboardPage(req: Request, res: Response) {
        if(req.user) {
            
            res.render('admin/dashboard.ejs', {
                user: req.user,
                title: 'Dashboard Admin',
                layout: './layouts/layout.ejs',
                currentRoute: '/admin'
            })
        } else {
            res.redirect('/login')
        }
    }

    static async usersPage(req: Request, res: Response) {
        if(req.user) {
            const userId = (req.user as User).id;
            const users = await AdminService.getAllUser(userId);   
            
            console.log(users);
            
               
            res.render('admin/users/index.ejs', {
                user: req.user,
                users: users,
                title: 'Dashboard Admin',
                layout:  './layouts/layout.ejs',
                currentRoute: '/admin/users'
            })
        } else {
            res.redirect('/login')
        }
    }

    static async broadcasterPage(req: Request, res: Response) {
        if(req.user) {
            const broadcasters = await AdminService.getAllBroadcaster()
                        
            res.render('admin/broadcasters/index.ejs', {
                user: req.user,
                broadcasters: broadcasters,
                title: 'Dashboard Admin',
                layout:  './layouts/layout.ejs',
                currentRoute: '/admin/broadcasters'
            })
        } else {
            res.redirect('/login')
        }
    }

    
    static async emailsPage(req: Request, res: Response) {
        if(req.user) {
            const emails = await AdminService.getAllEmail();
    
            const emailsWithDisplayDate = emails.map((email) => {
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
            
            res.render('admin/emails/index.ejs', {
                user: req.user,
                emails: emailsWithDisplayDate,
                title: 'Dashboard Admin',
                layout:  './layouts/layout.ejs',
                currentRoute: '/admin/emails'
            });
        } else {
            res.redirect('/login');
        }
    }
    

    static async createUserPage(req: Request, res: Response) {
        if(req.user) {
            res.render('admin/users/create.ejs', {
                user: req.user,
                title: 'Dashboard Admin',
                layout:  './layouts/layout.ejs',
                currentRoute: '/admin/users/create'
            })
        } else {
            res.redirect('/login')
        }
    }

    static async createBrodacasterPage(req: Request, res: Response) {
        if(req.user) {
            res.render('admin/broadcasters/create.ejs', {
                user: req.user,
                title: 'Dashboard Admin',
                layout:  './layouts/layout.ejs',
                currentRoute: '/admin/broadcasters/create'
            })
        } else {
            res.redirect('/login')
        }
    }

    static async editUserPage(req: Request, res: Response) {
        if (req.user) {
            const { id } = req.params; 

            try {
                const user = await AdminService.getUserById(parseInt(id)); 
                
                if (!user) {
                    return res.redirect('/admin/users');
                }

                res.render('admin/users/edit.ejs', {
                    user, 
                    title: 'Edit Broadcaster',
                    layout: './layouts/layout.ejs',
                    currentRoute: `/admin/users/${id}/edit/`
                });
            } catch (error) {
                res.redirect('/admin/broadcasters');
            }
        } else {
            res.redirect('/login');
        }
    }

    static async editBroadcasterPage(req: Request, res: Response) {
        if (req.user) {
            const { id } = req.params; // Mengambil id dari parameter URL
            try {
                const broadcaster = await AdminService.getBroadcasterById(parseInt(id)); // Panggil service untuk mendapatkan data broadcaster berdasarkan ID

                if (!broadcaster) {
                    return res.redirect('/admin/broadcasters');
                }

                res.render('admin/broadcasters/edit.ejs', {
                    user: req.user,
                    broadcaster: broadcaster, // Mengirim data broadcaster ke view edit
                    title: 'Edit Broadcaster',
                    layout: './layouts/layout.ejs',
                    currentRoute: `/admin/broadcasters/edit/${id}`
                });
            } catch (error) {
                res.redirect('/admin/broadcasters');
            }
        } else {
            res.redirect('/login');
        }
    }


    static async sentMailPage(req: Request, res: Response) {
        MailerViewController.currentRoute = '/admin/emails-sent';
        await MailerViewController.checkUserAndRender(req, res, "Terkirim", './admin/emails-sent/index.ejs', 'Dashboard Admin');
    }
}

export default AdminViewController