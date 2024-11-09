import { Request, Response } from 'express';

import AdminService from './admin.service'
import { HttpException } from '../../common/exceptions/HttpExceptions';
import HttpStatusCodes from '../../common/constants/http-status-codes';
import { plainToClass } from 'class-transformer';
import { RegisterDTO } from '../auth/dtos/register.dto';
import  bcrypt from 'bcrypt'
import AdminRepository from './admin.repository';
import MailService from '../mailer/mailer.service';


class AdminController {

    static async addUser(req: Request, res: Response) {
        try {
            const registerData = plainToClass(RegisterDTO, req.body);
            const {email, password, role} = registerData
            await AdminService.addUser(email, password, role);
            req.session.message = { text: 'Data has been saved successfully!', type: 'success' };

            res.redirect('/admin/users');
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }


    static async addBroadcaster(req: Request, res: Response) {
        try {
            const { email, appPassword } = req.body;

            await AdminService.addBroadcaster(email, appPassword); 
            req.session.message = { text: 'Data has been saved successfully!', type: 'success' };

            res.redirect('/admin/broadcasters')
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }


    static async deleteBroadcaster(req: Request, res: Response) {
        try {
            const { id } = req.params
            await AdminService.deleteBroadcasterById(parseInt(id));

            req.session.message = { text: 'Data has been deleted successfully!', type: 'success' };
            res.redirect('/admin/broadcasters')
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params
            await AdminService.deleteUserById(parseInt(id));
            req.session.message = { text: 'Data has been deleted successfully!', type: 'success' };


            res.redirect('/admin/users');
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }

    static async deleteEmail(req: Request, res: Response) {
        try {
            const { id } = req.params
            await MailService.deleteEmail(parseInt(id));
            req.session.message = { text: 'Data has been deleted successfully!', type: 'success' };

            res.redirect('/admin/emails');
            return
        } catch (error: any) {
            throw new HttpException(HttpStatusCodes.BAD_REQUEST, error.message)
        }
    }

    static async updateBroadcaster(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { email, appPassword } = req.body;

            await AdminService.updateBroadcaster(parseInt(id), { email, appPassword });
            req.session.message = { text: 'Data has been updated successfully!', type: 'success' };

            res.redirect('/admin/broadcasters')
        } catch (error: any) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

    static async updateUSer(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { email, password, role } = req.body;

            const existingUser = await AdminService.getUserById(parseInt(id));
            req.session.message = { text: 'Data has been updated successfully!', type: 'success' };
            
            if (!existingUser) {
                throw new HttpException(HttpStatusCodes.NOT_FOUND, `user with id ${id} is not found`);
            }

            const updatedData = {
                email,
                password: password ? password : existingUser.password, // Gunakan password lama jika tidak diisi
                role
            };

            if (password) {
                const saltRounds = 10;
                updatedData.password = await bcrypt.hash(password, saltRounds);
            }

            await AdminService.updateUser(parseInt(id), updatedData);

            res.redirect('/admin/users')
        } catch (error: any) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                message: error.message
            });
        }
    }


}

export default AdminController;